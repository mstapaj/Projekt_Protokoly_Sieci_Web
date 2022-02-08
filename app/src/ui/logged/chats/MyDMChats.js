import React, { useEffect, useState } from "react";
import * as mqtt from "mqtt";
import axios from "axios";
import { useHistory, useParams } from "react-router-dom";
import NavbarLogged from "../NavbarLogged";
import { Button, Stack } from "@mui/material";
import Notification from "../Notification";

const MyDMChats = () => {
    const params = useParams();
    const history = useHistory();
    const [client, setClient] = useState(null);
    const [dms, setDms] = useState([]);
    const [users, setUsers] = useState([]);
    const mqttConnect = (host, mqttOption) => {
        setClient(mqtt.connect(host, mqttOption));
    };
    useEffect(() => {
        axios.get("https://localhost:5000/users").then((res) => {
            if (res.status === 200) {
                setUsers(res.data);
            }
        });
        mqttConnect("mqtt://127.0.0.1:1884", {
            connectTimeout: 5000,
            path: "/mqtt",
        });
    }, []);

    useEffect(() => {
        if (client) {
            client.on("connect", () => {
                client.subscribe("DMChats");
                client.publish("DMChats", "getDM");
            });
            client.on("error", (err) => {
                console.error("Connection error: ", err);
                client.end();
            });
            client.on("message", (topic, message) => {
                const payload = { topic, message: message.toString() };
                if (
                    payload.topic === "DMChats" &&
                    payload.message !== "getDM"
                ) {
                    if (
                        dms !==
                        payload.message.split("~").filter((n) => n !== "")
                    ) {
                        setDms(
                            payload.message
                                .split("~")
                                .filter((n) => n !== "")
                                .filter(
                                    (n) =>
                                        n.split(":")[0] === params.id ||
                                        n.split(":")[1] === params.id
                                )
                                .map((n) =>
                                    n.split(":")[0] === params.id
                                        ? n.split(":")[1]
                                        : n.split(":")[0]
                                )
                        );
                    }
                }
            });
        }
    }, [client]);

    return (
        <div className={"auction-list"}>
            <h3>Prywatne czaty</h3>
            <NavbarLogged />
            <div className={"buttons"}>
                <Stack
                    direction={"row"}
                    spacing={"4px"}
                    justifyContent={"center"}
                >
                    <Button
                        variant={"outlined"}
                        onClick={() => history.goBack()}
                    >
                        Powrót
                    </Button>
                </Stack>
            </div>
            {
                <div className={"items"}>
                    {users &&
                    dms &&
                    users.length > 0 &&
                    dms.filter((n) => users.map((k) => k._id).includes(n))
                        .length > 0 ? (
                        dms
                            .filter((n) => users.map((k) => k._id).includes(n))
                            .map((n) => users.find((k) => n === k._id))
                            .map((n) => (
                                <div
                                    key={n._id}
                                    onClick={() =>
                                        history.push(
                                            `/logged/${params.id}/dmchat/${n._id}`
                                        )
                                    }
                                >
                                    <p>{n.login}</p>
                                </div>
                            ))
                    ) : (
                        <div key={"none"}>
                            <p>Brak prywatnych czatów</p>
                        </div>
                    )}
                </div>
            }
            <Notification />
        </div>
    );
};

export default MyDMChats;

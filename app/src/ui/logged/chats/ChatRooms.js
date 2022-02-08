import React, {useEffect, useState} from "react";
import * as mqtt from "mqtt";
import {useHistory, useParams} from "react-router-dom";
import NavbarLogged from "../NavbarLogged";
import {Button, Stack} from "@mui/material";
import {useConfirm} from "material-ui-confirm";
import Notification from "../Notification";

const ChatRooms = () => {
    const history = useHistory();
    const params = useParams();
    const confirm = useConfirm();
    const [client, setClient] = useState(null);
    const [rooms, setRooms] = useState([]);
    const mqttConnect = (host, mqttOption) => {
        setClient(mqtt.connect(host, mqttOption));
    };
    useEffect(() => {
        if (client) {
            client.on("connect", () => {
                client.subscribe("chatRooms");
                client.publish("chatRooms", "getRooms");
            });
            client.on("error", (err) => {
                console.error("Connection error: ", err);
                client.end();
            });
            client.on("message", (topic, message) => {
                const payload = {topic, message: message.toString()};
                if (payload.topic === "chatRooms" && payload.message !== "getRooms") {
                    if (rooms !== payload.message.split("~").filter(n => n !== "")) {
                        setRooms(payload.message.split("~").filter(n => n !== ""));
                    }
                }
            });
        }
    }, [client]);

    useEffect(() => {
        mqttConnect("mqtt://127.0.0.1:1884", {
            connectTimeout: 5000, path: "/mqtt"
        });
    }, []);

    const handleDelete = (roomName) => {
        confirm({
            title: "Czy na pewno chcesz usnunąć ten czat?", confirmationText: "Usuń czat", cancellationText: "Anuluj"
        }).then(() => {
            client.publish(roomName, "~DELETE");
        }).catch(() => {
        });

    };

    return (<div className={"auction-list"}>
        <h3>
            Pokoje czatów
        </h3>
        <NavbarLogged/>
        <div className={"buttons"}>
            <Stack direction={"row"} spacing={"4px"} justifyContent={"center"}>
                <Button variant={"outlined"} onClick={() => history.push(`/logged/${params.id}/addChatRoom`)}>Dodaj
                    pokój czatu
                </Button>
                <Button variant={"outlined"} onClick={() => history.goBack()}>
                    Powrót
                </Button>
            </Stack>
        </div>

        <div className={"items"}>
            {rooms.length > 0 && rooms.map(n => <div key={n} className={"space-bet"}>
                <p className={"chatroom"}
                   onClick={() => history.push(`/logged/${params.id}/chats/${n.split(":")[0]}`)}>{n.split(":")[0]}</p>
                {((n.split(":")[1] === params.id) || params.id === "000000000000000000000000") &&
                    <Button variant={"contained"} onClick={() => handleDelete(n.split(":")[0])}>Usuń czat</Button>}
            </div>)}

        </div>
        <Notification />
    </div>);
};

export default ChatRooms;

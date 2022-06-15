import React, { useEffect, useState } from "react";
import * as mqtt from "mqtt";
import { useHistory, useParams } from "react-router-dom";
import axios from "axios";
import _ from "lodash";
import NavbarLogged from "../NavbarLogged";
import { Alert, Button, Snackbar, Stack, TextField } from "@mui/material";
import Notification from "../Notification";

const DMChat = () => {
    const [client, setClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [login, setLogin] = useState("");
    const [temp, setTemp] = useState("");
    const [newMess, setNewMess] = useState("");
    const [chatter, setChatter] = useState("");
    const params = useParams();
    const history = useHistory();
    const [alertMessage, setAlertMessage] = useState("");
    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen(true);
    };

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }

        setOpen(false);
    };
    const mqttConnect = (host, mqttOption) => {
        setClient(mqtt.connect(host, mqttOption));
    };
    useEffect(() => {
        mqttConnect("mqtt://127.0.0.1:1884", {
            connectTimeout: 5000,
            path: "/mqtt",
        });
        setTimeout(() => {
            updateScroll();
        }, 1000);
        axios
            .get(`https://localhost:5000/users/${params.chatter}`)
            .then((res) => {
                if (res.status === 200) {
                    setChatter(res.data.login);
                }
            });
        axios.get(`https://localhost:5000/users/${params.id}`).then((res) => {
            if (res.status === 200) {
                setLogin(res.data.login);
            }
        });
    }, []);
    useEffect(() => {
        if (client) {
            client.on("connect", () => {
                const topic = `${_.sortBy([params.id, params.chatter])[0]}:${
                    _.sortBy([params.id, params.chatter])[1]
                }`;
                client.subscribe(topic);
                client.subscribe(`~${topic}`);
                client.publish(topic, "~getMessages");
            });
            client.on("error", (err) => {
                console.error("Connection error: ", err);
                client.end();
            });
            client.on("message", (topic, message) => {
                const payload = { topic, message: message.toString() };
                if (payload.topic[0] === "~") {
                    const allMessages = payload.message
                        .split("~")
                        .filter((n) => n !== "")
                        .reduce((acc, curr) => {
                            return [...acc, curr];
                        }, []);
                    setMessages(allMessages);
                    client.unsubscribe(
                        `~${_.sortBy([params.id, params.chatter])[0]}:${
                            _.sortBy([params.id, params.chatter])[1]
                        }`
                    );
                } else {
                    if (payload.message !== "~getMessages") {
                        setTemp(payload.message);
                    }
                }
            });
        }
    }, [client]);

    useEffect(() => {
        setMessages([...messages, temp]);
    }, [temp]);

    const handleSend = () => {
        if (newMess === "") {
            setAlertMessage("Wpisz wiadomość");
            handleClick();
        } else if (newMess.length > 500) {
            setAlertMessage("Wiadomość może mieć maksymalnie 500 znaków");
            handleClick();
        } else if (newMess.includes("~")) {
            setAlertMessage("Wiadomość nie może zawierać znaku ~");
            handleClick();
        } else {
            const dateTime = new Date();
            client.publish(params.chatter, `newMS${params.id}`);
            client.publish(
                `${_.sortBy([params.id, params.chatter])[0]}:${
                    _.sortBy([params.id, params.chatter])[1]
                }`,
                `${dateTime.toLocaleString()} ${login}: ${newMess}`
            );
        }
    };

    function updateScroll() {
        const element = document.getElementById("messages");
        if (element !== null) {
            element.scrollTop = element.scrollHeight;
        }
    }

    return (
        <div className={"auction-list"}>
            <h3
                className={"clickable"}
                onClick={() =>
                    history.push(`/logged/${params.id}/user/${params.chatter}`)
                }
            >
                Rozmowa z {chatter}
            </h3>
            <NavbarLogged />
            <div className={"buttons"}>
                <Stack
                    direction={"row"}
                    spacing={"4px"}
                    justifyContent={"center"}
                >
                    <Button
                        variant={"outlined"}
                        onClick={() => {
                            history.goBack();
                        }}
                    >
                        Powrót
                    </Button>
                </Stack>
            </div>
            <div className={"chat"}>
                <div className={"messages"} id={"messages"}>
                    {messages.length > 0 &&
                        messages.map((n) => (
                            <div key={n}>
                                <p>{n.slice(0, 20)}</p>
                                <p>{n.slice(20)}</p>
                            </div>
                        ))}
                </div>
                <div className={"mess"}>
                    <TextField
                        id={"outlined"}
                        onChange={(event) => setNewMess(event.target.value)}
                        fullWidth
                        placeholder={"Wpisz wiadomość"}
                    />
                    {messages[messages.length - 1] !==
                        "Pokój ten został zamknięty przez właściciela" && (
                        <Button
                            variant={"outlined"}
                            onClick={() => {
                                handleSend();
                                setTimeout(() => {
                                    updateScroll();
                                }, 200);
                                document.getElementById("outlined").value = "";
                            }}
                        >
                            Wyślij
                        </Button>
                    )}
                </div>
                <Snackbar
                    open={open}
                    autoHideDuration={6000}
                    onClose={handleClose}
                >
                    <Alert
                        onClose={handleClose}
                        severity="warning"
                        sx={{ width: "100%" }}
                    >
                        {alertMessage}
                    </Alert>
                </Snackbar>
            </div>
            <Notification />
        </div>
    );
};

export default DMChat;

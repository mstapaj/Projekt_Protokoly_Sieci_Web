import React, { useEffect, useState } from "react";
import axios from "axios";
import * as mqtt from "mqtt";
import { useParams } from "react-router-dom";
import SnackbarComponent from "../SnackbarComponent";

const Notification = () => {
    const [open, setOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [client, setClient] = useState(null);
    const params = useParams();

    const mqttConnect = (host, mqttOption) => {
        setClient(mqtt.connect(host, mqttOption));
    };
    useEffect(() => {
        mqttConnect("mqtt://127.0.0.1:1884", {
            connectTimeout: 5000,
            path: "/mqtt",
        });
    }, []);

    useEffect(() => {
        if (client) {
            client.on("connect", () => {
                if (params.id !== undefined) {
                    client.subscribe(params.id);
                }
            });
            client.on("error", (err) => {
                console.error("Connection error: ", err);
                client.end();
            });
            client.on("message", (topic, message) => {
                const payload = { topic, message: message.toString() };
                if (payload.message.slice(0, 5) === "newDM") {
                    axios
                        .get(
                            `https://localhost:5000/users/${payload.message.slice(
                                5
                            )}`
                        )
                        .then((res) => {
                            if (res.status === 200) {
                                setAlertMessage(
                                    `Użytkownik ${res.data.login} rozpoczął czat z Tobą`
                                );
                                handleClick();
                            }
                        });
                } else if (payload.message.slice(0, 5) === "newMS") {
                    if (params.chatter !== payload.message.slice(5)) {
                        axios
                            .get(
                                `https://localhost:5000/users/${payload.message.slice(
                                    5
                                )}`
                            )
                            .then((res) => {
                                if (res.status === 200) {
                                    setAlertMessage(
                                        `Użytkownik ${res.data.login} wysłał Ci wiadomość prywatną`
                                    );
                                    handleClick();
                                }
                            });
                    }
                } else if (payload.message.slice(0, 5) === "buyIT") {
                    axios
                        .get(
                            `https://localhost:5000/auctions/${payload.message.slice(
                                5
                            )}`
                        )
                        .then((res) => {
                            if (res.status === 200) {
                                setAlertMessage(
                                    `Produkt ${res.data.name} został kupiony`
                                );
                                handleClick();
                            }
                        });
                }
            });
        }
    }, [client]);

    const handleClick = () => {
        setOpen(true);
    };

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }

        setOpen(false);
    };

    return (
        <SnackbarComponent
            alertMessage={alertMessage}
            errorType={"info"}
            handleClose={handleClose}
            open={open}
        />
    );
};

export default Notification;

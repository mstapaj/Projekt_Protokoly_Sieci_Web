import React, {useEffect, useState} from "react";
import * as mqtt from "mqtt";
import {useHistory, useParams} from "react-router-dom";
import {Alert, Button, Snackbar, Stack} from "@mui/material";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Notification from "../Notification";

const ChatRoomForm = () => {

    const history = useHistory();
    const params = useParams();
    const [client, setClient] = useState(null);
    const [rooms, setRooms] = useState([]);
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
    const [roomName, setRoomName] = useState("");
    const handleSubmit = () => {
        if (roomName === "") {
            setAlertMessage("Podaj nazwę pokoju");
            handleClick();
        } else if (roomName.includes("~")) {
            setAlertMessage("Nazwa pokoju nie może zawierać ~");
            handleClick();
        } else if (rooms.map(n => n.split(":")[0]).includes(roomName)) {
            setAlertMessage("Pokój o takie nazwie już istnieje");
            handleClick();
        } else {
            client.publish("addRoom", roomName + "~" + params.id);
            history.goBack();
        }
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

    return (<div className={"login"}>
        <div className={"form"}>
            <h3>Dodaj pokój czatu</h3>
            <Box
                component="form"
                sx={{
                    "& .MuiTextField-root": {m: 1, width: "25ch"}
                }}
                noValidate
                autoComplete="off"
                flexWrap={"wrap"}
            >
                <Stack>
                    <TextField
                        id="outlined"
                        label="Nazwa pokoju"
                        onChange={(event => setRoomName(event.target.value))}
                    />
                </Stack>
                <Stack
                    spacing={2}
                    direction="row"
                    justifyContent={"center"}
                >
                    <Button variant={"text"} onClick={() => history.goBack()}>
                        Powrót
                    </Button>
                    <Button variant={"outlined"} onClick={() => handleSubmit()}>Dodaj pokój</Button>
                </Stack>
            </Box>
            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
            >
                <Alert
                    onClose={handleClose}
                    severity="error"
                    sx={{width: "100%"}}
                >
                    {alertMessage}
                </Alert>
            </Snackbar>
        </div>
        <Notification />
    </div>);
};

export default ChatRoomForm;
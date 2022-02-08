import React, {useState} from "react";
import {useHistory, useParams} from "react-router-dom";
import axios from "axios";
import Box from "@mui/material/Box";
import {Alert, Button, Dialog, DialogActions, DialogTitle, Snackbar, Stack} from "@mui/material";
import TextField from "@mui/material/TextField";
import Notification from "../Notification";

const ChangePasswordForm = () => {
    const history = useHistory();
    const params = useParams();
    const [pass, setPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [secondPass, setSecondPass] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };
    const handleClickOpen = () => {
        setOpenDialog(true);
    };

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
    const handleChangePassword = () => {
        let info = [];
        if (newPass.length < 8) {
            info.push("Nowe hasło jest za krótkie. Minimalnie 8 znaków.");
        } else if (newPass.length > 30) {
            info.push("Nowe hasło jest za długie. Maksymalnie 30 znaków.");
        }
        if (newPass !== secondPass) {
            info.push("\nHasła nie są identyczne.");
        }
        if (secondPass === newPass && newPass === pass) {
            info.push("\nStare i nowe hasło nie może być takie same.");
        }
        if (info.length === 0) {
            axios
                .put("https://localhost:5000/users/changePassword", {
                    id: params.id, oldPassword: pass, newPassword: newPass
                })
                .then((res) => {
                    if (res.data === true) {
                        handleClickOpen()
                    } else {
                        setAlertMessage("Nie udało się zmienić hasła");
                        handleClick();
                    }
                });
        } else {
            setAlertMessage(info);
            handleClick();
        }
    };

    return (<div className={"login"}>
        <div className={"form"}>
            <h3>Zmiana hasła</h3>
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
                        label="Stare hasło"
                        type={'password'}
                        onChange={(event) => setPass(event.target.value)}
                    />
                    <TextField
                        id="outlined-password-input"
                        label="Nowe hasło"
                        type="password"
                        onChange={(event) => setNewPass(event.target.value)}
                    />
                    <TextField
                        id="outlined-password-input"
                        label="Powtórz nowe hasło"
                        type="password"
                        onChange={(event) => setSecondPass(event.target.value)}
                    />

                </Stack>
                <Stack
                    spacing={2}
                    direction="row"
                    justifyContent={"center"}
                >
                    <Button variant={"text"} onClick={() => history.goBack()}>Powrót</Button>
                    <Button variant={"contained"} onClick={() => handleChangePassword()}>Zmień hasło</Button>
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
        <Dialog
            position={'absolute'}
            open={openDialog}
            onClose={handleCloseDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {"Pomyślnie zmieniono hasło"}
            </DialogTitle>
            <DialogActions>
                <Button onClick={() => history.goBack()}>Powrót</Button>
            </DialogActions>
        </Dialog>
        <Notification />
    </div>);
};

export default ChangePasswordForm;

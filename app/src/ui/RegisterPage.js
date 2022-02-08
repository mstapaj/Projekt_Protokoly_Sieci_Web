import { useHistory } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar,
    Stack,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Cookies from "js-cookie";

const RegisterPage = () => {
    const history = useHistory();
    const [login, setLogin] = useState("");
    const [pass, setPass] = useState("");
    const [secondPass, setSecondPass] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };
    const handleClickOpen = () => {
        setOpenDialog(true);
    };

    const handleRegister = () => {
        let info = [];
        if (login.length < 3) {
            info.push("Login jest za krótki. Minimalnie 3 znaki.");
        } else if (login.length > 30) {
            info.push("Login jest za długi. Maksymalnie 30 znaków.");
        }
        if (pass.length < 8) {
            info.push("\nHasło jest za krótkie. Minimalnie 8 znaków.");
        } else if (pass.length > 30) {
            info.push("\nHasło jest za długie. Maksymalnie 30 znaków.");
        }
        if (pass !== secondPass) {
            info.push("\nHasła nie są identyczne.");
        }
        if (info.length === 0) {
            const amountOfRegister = Cookies.get("BlockedRegister");
            if (amountOfRegister === "3") {
                setAlertMessage("Nie udało się zarejstrować");
                handleClick();
            } else {
                axios.get("https://localhost:5000/users/logins").then((req) => {
                    if (req.data.includes(login)) {
                        setAlertMessage("Login jest już zajęty");
                        handleClick();
                    } else {
                        axios
                            .post("https://localhost:5000/users/register", {
                                login: login,
                                password: pass,
                            })
                            .then((res) => {
                                if (res.data === true) {
                                    Cookies.set(
                                        "BlockedRegister",
                                        parseInt(amountOfRegister) + 1,
                                        {
                                            expires: new Date(
                                                new Date().getTime() +
                                                    60 * 60 * 1000
                                            ),
                                        }
                                    );
                                    handleClickOpen();
                                } else {
                                    setAlertMessage(
                                        "Nie udało się zarejstrować"
                                    );
                                    handleClick();
                                }
                            });
                    }
                });
            }
        } else {
            setAlertMessage(info);
            handleClick();
        }
    };

    useEffect(() => {
        const amountOfRegister = Cookies.get("BlockedRegister");
        if (amountOfRegister === undefined) {
            Cookies.set("BlockedRegister", 0, {
                expires: new Date(new Date().getTime() + 60 * 60 * 1000),
            });
        }
    }, []);

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

    return (
        <div className={"login"}>
            <div className={"form"}>
                <h3>Rejestracja</h3>
                <Box
                    component="form"
                    sx={{
                        "& .MuiTextField-root": { m: 1, width: "25ch" },
                    }}
                    noValidate
                    autoComplete="off"
                    flexWrap={"wrap"}
                >
                    <Stack>
                        <TextField
                            id="outlined"
                            label="Login"
                            onChange={(event) => setLogin(event.target.value)}
                        />
                        <TextField
                            id="outlined-password-input"
                            label="Hasło"
                            type="password"
                            onChange={(event) => setPass(event.target.value)}
                        />
                        <TextField
                            id="outlined-password-input"
                            label="Powtórz hasło"
                            type="password"
                            onChange={(event) =>
                                setSecondPass(event.target.value)
                            }
                        />
                    </Stack>
                    <Stack
                        spacing={2}
                        direction="row"
                        justifyContent={"center"}
                    >
                        <Button
                            variant={"text"}
                            onClick={() => history.push("/")}
                        >
                            Powrót
                        </Button>
                        <Button
                            variant={"contained"}
                            onClick={() => handleRegister()}
                        >
                            Zarejstruj się
                        </Button>
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
                        sx={{ width: "100%" }}
                    >
                        {alertMessage}
                    </Alert>
                </Snackbar>
            </div>
            <Dialog
                position={"absolute"}
                open={openDialog}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Udało się zarejestrować"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Teraz możesz się zalogować
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => history.push("/")}>Powrót</Button>
                    <Button onClick={() => history.push("/login")}>
                        Zaloguj się
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default RegisterPage;

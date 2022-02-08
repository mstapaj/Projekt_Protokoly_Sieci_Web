import React, {useEffect, useState} from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogTitle,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Snackbar,
    Stack
} from "@mui/material";
import TextField from "@mui/material/TextField";
import {useHistory, useParams} from "react-router-dom";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import Notification from "../Notification";

const EditAccount = () => {

    const params = useParams();
    const history = useHistory();
    const [firstLogin, setFirstLogin] = useState('')
    const [login, setLogin] = useState("");
    const [pass, setPass] = useState("");
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

    const [values, setValues] = useState({
        amount: "", password: "", weight: "", weightRange: "", showPassword: false
    });
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
        if (info.length === 0) {
            axios.get("https://localhost:5000/users/logins").then((req) => {
                if (req.data.includes(login)) {
                    setAlertMessage("Login jest już zajęty");
                    handleClick();
                } else {
                    axios
                        .put(`https://localhost:5000/users/editAccount/${params.userId}`, {
                            login: login, password: pass
                        })
                        .then((res) => {
                            if (res.data === true) {
                                handleClickOpen();
                            } else {
                                setAlertMessage("Nie udało się edytować użytkownika");
                                handleClick();
                            }
                        });
                }
            });
        } else {
            setAlertMessage(info);
            handleClick();
        }
    };

    const handleChange = (prop) => (event) => {
        setValues({...values, [prop]: event.target.value});
    };
    const handleClickShowPassword = () => {
        setValues({
            ...values, showPassword: !values.showPassword
        });
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };


    useEffect(() => {
        axios
            .get(`https://localhost:5000/users/${params.userId}`)
            .then((res) => {
                if (res.status === 200) {
                    setLogin(res.data.login);
                    setPass(res.data.password);
                    setFirstLogin(res.data.login)
                } else {
                    setAlertMessage("Błąd ładowania danych");
                    handleClick();
                }
            });
    }, []);

    return (<div className={"login"}>
        <div className={"form"}>
            <h3>Edycja użytkownika {firstLogin}</h3>
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
                        label="Login"
                        value={login}
                        onChange={(event) => setLogin(event.target.value)}
                    />
                    <FormControl
                        sx={{m: 1, width: "25ch"}}
                        variant="outlined"
                        onChange={(event) => setPass(event.target.value)}
                    >
                        <InputLabel htmlFor="outlined-adornment-password">
                            Hasło
                        </InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password"
                            type={values.showPassword ? "text" : "password"}
                            value={pass}
                            onChange={handleChange("password")}
                            endAdornment={<InputAdornment position="end">
                                <IconButton
                                    aria-label="Zmień widoczność hasła"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                >
                                    {values.showPassword ? (<VisibilityOff/>) : (<Visibility/>)}
                                </IconButton>
                            </InputAdornment>}
                            label="Password"
                        />
                    </FormControl>

                </Stack>
                <Stack
                    spacing={2}
                    direction="row"
                    justifyContent={"center"}
                >
                    <Button variant={"text"} onClick={() => history.goBack()}>Powrót</Button>
                    <Button variant={"contained"} onClick={() => handleRegister()}>Zatwierdź zmiany</Button>
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
            position={"absolute"}
            open={openDialog}
            onClose={handleCloseDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {"Użytkownik został pomyślnie edytowany"}
            </DialogTitle>
            <DialogActions>
                <Button onClick={() => history.goBack()}>Powrót</Button>
            </DialogActions>
        </Dialog>
        <Notification />
    </div>);
};


export default EditAccount;
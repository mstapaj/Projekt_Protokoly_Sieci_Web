import { useHistory } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Box from "@mui/material/Box";
import {
    Button,
    DialogContentText,
    FormControl,
    FormHelperText,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Stack,
    Switch,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SnackbarComponent from "./SnackbarComponent";

const LoginPage = () => {
    const history = useHistory();
    const [login, setLogin] = useState("");
    const [pass, setPass] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [values, setValues] = useState({
        amount: "",
        password: "",
        weight: "",
        weightRange: "",
        showPassword: false,
    });

    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(true);
    };

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }

        setOpen(false);
    };

    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
    };
    const handleClickShowPassword = () => {
        setValues({
            ...values,
            showPassword: !values.showPassword,
        });
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const label = { inputProps: { "aria-label": "Switch demo" } };

    const handleLogin = () => {
        const amountOfLogin = Cookies.get("BlockedLogin");
        const blockingMultiplier = Cookies.get("BlockingMultiplier");
        if (amountOfLogin === "5") {
            setAlertMessage(
                "Nie udało się zalogować. Nieprawidłowy login lub hasło"
            );
            handleClick();
        } else {
            axios
                .post("https://localhost:5000/users/login", {
                    login: login,
                    password: pass,
                })
                .then((res) => {
                    if (res.status === 200) {
                        if (res.data) {
                            Cookies.remove("BlockedLogin");
                            Cookies.remove("BlockingMultiplier");
                            if (rememberMe) {
                                Cookies.set(
                                    "AuctionPageSavedLogin",
                                    `${login}/${pass}`,
                                    { expires: 3 }
                                );
                            }
                            history.push(`/logged/${res.data._id}`);
                        } else {
                            if (amountOfLogin) {
                                Cookies.set(
                                    "BlockedLogin",
                                    parseInt(amountOfLogin) + 1,
                                    {
                                        expires: new Date(
                                            new Date().getTime() +
                                                parseInt(blockingMultiplier) *
                                                    10 *
                                                    60 *
                                                    1000
                                        ),
                                    }
                                );
                                if (parseInt(amountOfLogin) + 1 === 5) {
                                    Cookies.set(
                                        "BlockingMultiplier",
                                        parseInt(blockingMultiplier) + 1,
                                        { expires: 1 }
                                    );
                                }
                            } else {
                                Cookies.set("BlockedLogin", 0, {
                                    expires: new Date(
                                        new Date().getTime() +
                                            parseInt(blockingMultiplier) *
                                                10 *
                                                60 *
                                                1000
                                    ),
                                });
                            }
                            setAlertMessage(
                                "Nie udało się zalogować. Nieprawidłowy login lub hasło"
                            );
                            handleClick();
                        }
                    } else {
                        setAlertMessage(
                            "Nie udało się zalogować. Błąd serwera"
                        );
                        handleClick();
                    }
                });
        }
    };

    useEffect(() => {
        const amountOfLogin = Cookies.get("BlockedLogin");
        const blockingMultiplier = Cookies.get("BlockingMultiplier");
        if (amountOfLogin === undefined) {
            Cookies.set("BlockedLogin", 0, {
                expires: new Date(new Date().getTime() + 10 * 60 * 1000),
            });
        }
        if (blockingMultiplier === undefined) {
            Cookies.set("BlockingMultiplier", 1, {
                expires: 1,
            });
        }
    }, []);

    return (
        <div className="login">
            <div className={"form"}>
                <h3>Logowanie</h3>
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
                        <FormControl
                            sx={{ m: 1, width: "25ch" }}
                            variant="outlined"
                            onChange={(event) => setPass(event.target.value)}
                        >
                            <InputLabel htmlFor="outlined-adornment-password">
                                Hasło
                            </InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-password"
                                type={values.showPassword ? "text" : "password"}
                                value={values.password}
                                onChange={handleChange("password")}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="Zmień widoczność hasła"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={
                                                handleMouseDownPassword
                                            }
                                            edge="end"
                                        >
                                            {values.showPassword ? (
                                                <VisibilityOff />
                                            ) : (
                                                <Visibility />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Password"
                            />
                        </FormControl>
                    </Stack>
                    <Stack
                        spacing={2}
                        direction="row"
                        justifyContent={"center"}
                        alignItems={"center"}
                        marginBottom={"4px"}
                    >
                        <FormHelperText>Zapamiętaj mnie</FormHelperText>
                        <Switch
                            {...label}
                            onClick={() => {
                                if (rememberMe) {
                                    setRememberMe(false);
                                } else setRememberMe(true);
                            }}
                        />
                    </Stack>
                    <Stack
                        spacing={2}
                        direction="row"
                        justifyContent={"center"}
                        marginBottom={"50px"}
                    >
                        <Button
                            onClick={() => history.push("/")}
                            variant="text"
                        >
                            Powrót
                        </Button>
                        <Button
                            onClick={() => handleLogin()}
                            variant="contained"
                        >
                            Zaloguj się
                        </Button>
                    </Stack>
                    <Stack direction={"column"} spacing={"2px"}>
                        <DialogContentText textAlign={"center"}>
                            Nie masz konta?
                        </DialogContentText>
                        <Button
                            onClick={() => history.push("/register")}
                            variant="outlined"
                        >
                            Zarejestruj się
                        </Button>
                    </Stack>
                    <SnackbarComponent
                        alertMessage={alertMessage}
                        errorType={"error"}
                        handleClose={handleClose}
                        open={open}
                    />
                </Box>
            </div>
        </div>
    );
};

export default LoginPage;

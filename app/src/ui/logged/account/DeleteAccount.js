import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { Button, Stack } from "@mui/material";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Notification from "../Notification";
import SnackbarComponent from "../../SnackbarComponent";
import DialogComponent from "../../DialogComponent";

const DeleteAccount = () => {
    const params = useParams();
    const history = useHistory();
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

    const handleDelete = () => {
        axios
            .post("https://localhost:5000/users/deleteAccount", {
                id: params.id,
                password: pass,
            })
            .then((res) => {
                if (res.status === 200) {
                    if (res.data) {
                        Cookies.remove("AuctionPageSavedLogin");
                        history.push("/");
                    } else {
                        setAlertMessage(
                            "Błędne hasło. Nie udało się usunąć konta"
                        );
                        handleClick();
                        handleCloseDialog();
                    }
                } else {
                    setAlertMessage("Nie udało się usunąć konta");
                    handleClick();
                    handleCloseDialog();
                }
            });
    };

    return (
        <div className={"login"}>
            <div className={"form"}>
                <Box
                    component="form"
                    sx={{
                        "& .MuiTextField-root": { m: 1, width: "25ch" },
                    }}
                    noValidate
                    autoComplete="off"
                    flexWrap={"wrap"}
                >
                    <h3>Usuwanie konta</h3>
                    <p>Czy na pewno chcesz usunąć swoje konto?</p>
                    <p>
                        Wszystkie twoje aukcje, komentarze, czaty zostaną
                        automatycznie usunięte.
                    </p>
                    <p>Proces ten jest nieodwrcalny.</p>
                    <p>Aby usunąć konto, podaj swoje hasło:</p>
                    <div className={"delete-acc"}>
                        <TextField
                            id="outlined-password-input"
                            label="Hasło"
                            type="password"
                            onChange={(event) => setPass(event.target.value)}
                        />
                    </div>
                    <Stack
                        spacing={2}
                        direction="row"
                        justifyContent={"center"}
                    >
                        <Button onClick={() => history.goBack()}>Powrót</Button>
                        <Button
                            variant={"outlined"}
                            onClick={() => handleClickOpen()}
                        >
                            Usuń konto
                        </Button>
                    </Stack>
                </Box>
                <SnackbarComponent
                    alertMessage={alertMessage}
                    errorType={"error"}
                    handleClose={handleClose}
                    open={open}
                />
            </div>
            <DialogComponent
                title={"Czy na pewno chcesz usunąć swoje konto?"}
                openDialog={openDialog}
                handleCloseDialog={handleCloseDialog}
                firstButtonAction={() => history.goBack()}
                firstButtonDesc={"Anuluj"}
                secondButtonAction={() => handleDelete()}
                secondButtonDesc={"Usuń konto"}
            />
            <Notification />
        </div>
    );
};

export default DeleteAccount;

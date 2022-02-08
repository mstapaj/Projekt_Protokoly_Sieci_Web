import React, {useEffect, useState} from "react";
import {useHistory, useParams} from "react-router-dom";
import axios from "axios";
import {Alert, Button, Dialog, DialogActions, DialogTitle, Snackbar, Stack} from "@mui/material";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Notification from "../Notification";

const AuctionForm = () => {

    const params = useParams();
    const history = useHistory();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [amount, setAmount] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
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
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };
    const handleClickOpen = () => {
        setOpenDialog(true);
    };
    const [init, setInit] = useState({
        name: "",
        description: "",
        price: "",
        amount: "",
        user: params.id
    });


    const handleSubmit = () => {
        let errors = ''
        if (title.length === 0) {
            errors = errors + 'Nazwa jest wymagana. '
        } else if (title.length < 3) {
            errors = errors + "Nazwa musi mieć przynajmniej 3 znaki. "
        } else if (title.length > 50) {
            errors = errors + "Nazwa może mieć maksymalnie 50 znaków. "
        }
        if (description.length === 0) {
            errors = errors + 'Opis jest wymagany. '
        } else if (description.length > 500) {
            errors = errors + "Opis może mieć maksymalnie 500 znaków. "
        }
        if (price === '') {
            errors = errors + 'Cena jest wymagana. '
        } else if (isNaN(parseInt(price))) {
            errors = errors + 'Cena musi być liczbą. '
        } else if (price < 0) {
            errors = errors + "Cena musi wynosić przynajmniej 0. "
        }
        if (amount === '') {
            errors = errors + 'Ilość jest wymagana. '
        } else if (isNaN(parseInt(amount))) {
            errors = errors + 'Ilość musi być liczbą. '
        } else if (amount < 1) {
            errors = errors + "Ilość musi wynosić przynajmniej 1. "
        }
        if (errors === '') {
            const preparedData = {
                ...init,
                name: title,
                description: description,
                price: price,
                amount: amount
            }
            if (params.auctionId) {
                axios.put("https://localhost:5000/auctions/editAuction", preparedData).then((res) => {
                    if (res.status === 200) {
                        handleClickOpen()
                    } else {
                        setAlertMessage("Nie udało się edytować aukcji")
                        handleClick()
                    }
                });
            } else {
                axios.post("https://localhost:5000/auctions/addAuction", preparedData).then((res) => {
                    if (res.status === 200) {
                        handleClickOpen()
                    } else {
                        setAlertMessage("Nie udało się dodać aukcji")
                        handleClick()
                    }
                });
            }
        } else {
            setAlertMessage(errors)
            handleClick()
        }
    };

    useEffect(() => {
        if (params.auctionId) {
            axios.get(`https://localhost:5000/auctions/${params.auctionId}`).then((res) => {
                if (res.status === 200) {
                    setInit(res.data);
                    setTitle(res.data.name);
                    setAmount(res.data.amount);
                    setPrice(res.data.price);
                    setDescription(res.data.description);
                } else {
                }
            });
        }
    }, []);


    return (
        <div className={"login"}>
            <div className={"form"}>
                {(params.auctionId) ? <h3>Edytuj aukcje</h3> : <h3>Dodaj aukcje</h3>}
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
                            label="Nazwa"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                        />
                        <TextField
                            id="outlined"
                            label="Opis"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                        />
                        <TextField
                            id="outlined"
                            label="Cena"
                            value={price}
                            onChange={(event) => setPrice(event.target.value)}
                        />
                        <TextField
                            id="outlined"
                            label="Ilość"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                        />
                    </Stack>
                    <Stack
                        spacing={2}
                        direction="row"
                        justifyContent={"center"}
                        marginTop={"10px"}
                    >
                        <Button variant={"text"} onClick={() => history.goBack()}>Powrót</Button>
                        {(params.auctionId) ?
                            <Button variant={"outlined"} onClick={() => handleSubmit()}>Edytuj aukcje</Button> :
                            <Button onClick={() => handleSubmit()} variant={"outlined"}>Dodaj aukcje</Button>}
                    </Stack>
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
                </Box>
                <Dialog
                    position={"absolute"}
                    open={openDialog}
                    onClose={handleCloseDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {(params.auctionId) ? "Udało się edytowac aukcje" : "Udało się dodać aukcje"}
                    </DialogTitle>
                    <DialogActions>
                        <Button onClick={() => history.goBack()}>Powrót</Button>
                    </DialogActions>
                </Dialog>
            </div>
            <Notification />
        </div>
    );
};

export default AuctionForm;
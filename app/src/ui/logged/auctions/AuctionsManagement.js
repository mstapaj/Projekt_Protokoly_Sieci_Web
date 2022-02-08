import axios from "axios";
import React, {useEffect, useState} from "react";
import {useHistory, useParams} from "react-router-dom";
import SearchBar from "../../SearchBar";
import NavbarLogged from "../NavbarLogged";
import {Alert, Button, Snackbar, Stack} from "@mui/material";
import {useConfirm} from "material-ui-confirm";
import Notification from "../Notification";

const AuctionsManagement = () => {
    const params = useParams();
    const history = useHistory();
    const confirm = useConfirm()
    const [auctions, setAuctions] = useState([]);
    const [open, setOpen] = React.useState(false);
    const [errorType, setErrorType] = useState('info');
    const [alertMessage, setAlertMessage] = useState("");

    const handleClick = () => {
        setOpen(true);
    };

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }

        setOpen(false);
    };

    const getAllAuctions = () => {
        axios
            .get(`https://localhost:5000/auctions`)
            .then((res) => {
                if (res.status === 200) {
                    setAuctions(res.data);
                } else {
                    setAlertMessage("Błąd ładowania danych");
                    setErrorType("error");
                    handleClick();
                }
            });
    };

    useEffect(() => {
        getAllAuctions();
    }, []);

    const handleDelete = (values) => {
        confirm({
            title: "Czy na pewno chcesz usnunąć tą aukcje?", confirmationText: "Usuń aukcje", cancellationText: "Anuluj"
        }).then(() => {
            axios
                .delete(`https://localhost:5000/auctions/deleteAuction/${values}`)
                .then((res) => {
                    if (res.status === 200) {
                        setAlertMessage("Udało się usunąć aukcje");
                        setErrorType("success");
                        setAuctions(auctions.filter((n) => n._id !== values));
                        handleClick();
                    } else {
                        setAlertMessage("Nie udało się usunąć aukcji");
                        setErrorType("error");
                        handleClick();
                    }
                });
        }).catch(() => {
        });

    };

    return (<div className={"auction-list"}>
        <h3>Zarządzanie aukcjami</h3>
        <NavbarLogged/>
        <div className={"buttons"}>
            <Stack direction={"row"} spacing={"4px"} justifyContent={"center"}>
                <Button variant={"outlined"} onClick={() => getAllAuctions()}>Odśwież aukcje</Button>
                <Button variant={"outlined"} onClick={() => history.goBack()}>
                    Powrót
                </Button>
            </Stack>
        </div>
        <SearchBar setAuctions={setAuctions} cancelSearch={getAllAuctions}/>
        <div className={"items"}>
            {auctions.map((n) => (<div>
                <div key={n._id} onClick={() => history.push(`/logged/${params.id}/auction/${n._id}`)} className={"details"}>
                    <p>
                        Nazwa: {n.name}
                    </p>
                    <p>
                        Cena: {n.price}
                    </p>
                    <p>
                        Ilość: {n.amount}
                    </p>
                    <p>
                        Opis: {n.description}
                    </p>
                </div>
                <div className={"buttons"}>
                    <Button
                        variant={"text"}
                        onClick={() => history.push(`/logged/${params.id}/editAuction/${n._id}`)}
                    >
                        Edytuj aukcje
                    </Button>
                    <Button variant={"text"} onClick={() => handleDelete(n._id)}>
                        Usuń aukcję
                    </Button>
                </div>
            </div>))}
        </div>
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
        >
            <Alert
                onClose={handleClose}
                severity={errorType}
                sx={{width: "100%"}}
            >
                {alertMessage}
            </Alert>
        </Snackbar>
        <Notification />
    </div>);
};

export default AuctionsManagement;

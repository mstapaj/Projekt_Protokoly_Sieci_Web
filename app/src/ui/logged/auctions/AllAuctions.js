import React, {useEffect, useState} from "react";
import {useHistory, useParams} from "react-router-dom";
import axios from "axios";
import SearchBar from "../../SearchBar";
import NavbarLogged from "../NavbarLogged";
import {Alert, Button, Snackbar, Stack} from "@mui/material";
import Notification from "../Notification";

const AllAuctions = () => {
    const [auctions, setAuctions] = useState([]);
    const history = useHistory();
    const params = useParams();

    const [alertMessage, setAlertMessage] = useState("");

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

    const getAllAuctions = () => {
        axios.get("https://localhost:5000/auctions").then((res) => {
            if (res.status === 200) {
                setAuctions(res.data);
            } else {
                alert("Błąd ładowania danych");
            }
        });
    };

    useEffect(() => {
        getAllAuctions();
    }, []);

    return (<div className={"auction-list"}>
        <h3>Lista aukcji</h3>
        <NavbarLogged/>
        <div className={"buttons"}>
            <Stack direction={"row"} spacing={"4px"} justifyContent={"center"}>
                <Button variant={"outlined"} onClick={() => getAllAuctions()}>Odśwież aukcje</Button>
                <Button variant={"outlined"} onClick={() => history.goBack()}>
                    Powrót
                </Button>
            </Stack>
        </div>
        <SearchBar
            setAuctions={setAuctions}
            cancelSearch={getAllAuctions}
            setAlertMessage={setAlertMessage}
            handleClick={handleClick}
        />
        <div className={"items"}>

            {auctions.map((n) => (
                <div key={n._id} className={'space-bet'} onClick={() => history.push(`/logged/${params.id}/auction/${n._id}`)}>
                    <p>
                        {n.name}
                    </p>
                    <p>
                        Cena: {n.price}
                    </p>
                </div>))}
        </div>
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
        >
            <Alert
                onClose={handleClose}
                severity="warning"
                sx={{width: "100%"}}
            >
                {alertMessage}
            </Alert>
        </Snackbar>
        <Notification />
    </div>);
};

export default AllAuctions;

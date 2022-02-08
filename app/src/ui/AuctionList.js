import axios from "axios";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import SearchBar from "./SearchBar";
import Navbar from "./Navbar";
import { Button, Stack } from "@mui/material";
import SnackbarComponent from "./SnackbarComponent";

const AuctionList = () => {
    const [auctions, setAuctions] = useState([]);
    const history = useHistory();

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
                setAlertMessage("Błąd ładowania danych");
                handleClick();
            }
        });
    };

    useEffect(() => {
        getAllAuctions();
    }, []);

    return (
        <div className={"auction-list"}>
            <h3>Lista aukcji</h3>
            <Navbar />
            <div className={"buttons"}>
                <Stack
                    direction={"row"}
                    spacing={"4px"}
                    justifyContent={"center"}
                >
                    <Button
                        variant={"outlined"}
                        onClick={() => getAllAuctions()}
                    >
                        Odśwież aukcje
                    </Button>
                    <Button
                        variant={"outlined"}
                        onClick={() => history.push("/")}
                    >
                        Powrót na strone główną
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
                    <div
                        className={"space-bet"}
                        key={n._id}
                        onClick={() => history.push(`/auctions/${n._id}`)}
                    >
                        <p>{n.name}</p>
                        <p>Cena: {n.price}</p>
                    </div>
                ))}
            </div>
            <SnackbarComponent
                alertMessage={alertMessage}
                errorType={"warning"}
                handleClose={handleClose}
                open={open}
            />
        </div>
    );
};

export default AuctionList;

import axios from "axios";
import { useState } from "react";
import { Button, Stack, TextField } from "@mui/material";

const SearchBar = ({
    setAuctions,
    cancelSearch,
    handleClick,
    setAlertMessage,
}) => {
    const [word, setWord] = useState("");

    return (
        <div className={"search-bar"}>
            <Stack
                direction={"row"}
                spacing={"4px"}
                justifyContent={"center"}
                marginTop={"4px"}
            >
                <TextField
                    style={{
                        maxWidth: "800px",
                        maxHeight: "40px",
                        minWidth: "400px",
                        minHeight: "40px",
                    }}
                    id="outlined-basic"
                    variant="outlined"
                    placeholder={"Wyszukaj aukcję"}
                    onChange={(event) => setWord(event.target.value)}
                />
                <Button
                    style={{
                        maxWidth: "200px",
                        maxHeight: "40px",
                        minWidth: "180px",
                        minHeight: "40px",
                    }}
                    variant={"outlined"}
                    onClick={() => {
                        if (word === "") {
                            cancelSearch();
                        } else {
                            axios
                                .get(
                                    `https://localhost:5000/auctions/search/${word}`
                                )
                                .then((res) => {
                                    if (res.status === 200) {
                                        if (res.data.length === 0) {
                                            setAlertMessage(
                                                "Nie znaleziono takich aukcji"
                                            );
                                            handleClick();
                                            setAuctions(res.data);
                                        } else {
                                            setAuctions(res.data);
                                        }
                                    } else {
                                        setAlertMessage(
                                            "Błąd ładowania danych"
                                        );
                                        handleClick();
                                    }
                                });
                        }
                    }}
                >
                    Wyszukaj aukcje
                </Button>
                <Button
                    style={{
                        maxWidth: "200px",
                        maxHeight: "40px",
                        minWidth: "200px",
                        minHeight: "40px",
                    }}
                    variant={"outlined"}
                    onClick={() => cancelSearch()}
                >
                    Cofnij wyszukiwanie
                </Button>
            </Stack>
        </div>
    );
};

export default SearchBar;

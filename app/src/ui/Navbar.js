import { Button, Stack } from "@mui/material";
import { useHistory } from "react-router-dom";
import React, { useState } from "react";
import DialogComponent from "./DialogComponent";

const Navbar = () => {
    const history = useHistory();
    const [openDialog, setOpenDialog] = useState(false);
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };
    const handleClickOpen = () => {
        setOpenDialog(true);
    };

    return (
        <div className={"navbar"}>
            <Stack direction={"row"} spacing={"4px"} justifyContent={"center"}>
                <Button
                    background={"white"}
                    variant="outlined"
                    backgroundColor={"white"}
                    onClick={() => history.push("/login")}
                >
                    Zaloguj się
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => history.push("/register")}
                >
                    Zarejstruj się
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => history.push("/auctions")}
                >
                    Lista aukcji
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => {
                        handleClickOpen();
                    }}
                >
                    Dodaj przedmiot na sprzedaż
                </Button>
                <DialogComponent
                    title={"Musisz się zalogować, aby móc dodać aukcję"}
                    openDialog={openDialog}
                    handleCloseDialog={handleCloseDialog}
                    firstButtonAction={() => handleCloseDialog()}
                    firstButtonDesc={"Anuluj"}
                    secondButtonAction={() => history.push("/login")}
                    secondButtonDesc={"Zaloguj się"}
                />
            </Stack>
        </div>
    );
};

export default Navbar;

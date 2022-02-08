import {Button, Dialog, DialogActions, DialogTitle, Stack} from "@mui/material";
import {useHistory} from "react-router-dom";
import React, {useState} from "react";


const Navbar = () => {

    const history = useHistory()
    const [openDialog, setOpenDialog] = useState(false);
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };
    const handleClickOpen = () => {
        setOpenDialog(true);
    };

    return (
        <div className={"navbar"}>
            <Stack direction={'row'} spacing={'4px'} justifyContent={'center'}>
                <Button background={'white'} variant="outlined" backgroundColor={"white"}
                        onClick={() => history.push("/login")}>Zaloguj
                    się</Button>
                <Button variant="outlined" onClick={() => history.push("/register")}>
                    Zarejstruj się
                </Button>
                <Button variant="outlined" onClick={() => history.push("/auctions")}>
                    Lista aukcji
                </Button>
                <Button variant="outlined"
                        onClick={() => {
                            handleClickOpen()
                        }}
                >
                    Dodaj przedmiot na sprzedaż
                </Button>
                <Dialog
                    position={'absolute'}
                    open={openDialog}
                    onClose={handleCloseDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Musisz się zalogować, aby móc dodać aukcję"}
                    </DialogTitle>
                    <DialogActions>
                        <Button onClick={() => handleCloseDialog()}>Anuluj</Button>
                        <Button onClick={() => history.push("/login")}>Zaloguj się</Button>
                    </DialogActions>
                </Dialog>
            </Stack>
        </div>
    );
};

export default Navbar;
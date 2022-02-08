import NavbarLogged from "../NavbarLogged";
import axios from "axios";
import React, {useEffect, useState} from "react";
import {Alert, Button, Snackbar, Stack} from "@mui/material";
import {useHistory, useParams} from "react-router-dom";
import {useConfirm} from "material-ui-confirm";
import Notification from "../Notification";

const AccountManagement = () => {

    const [users, setUsers] = useState([]);
    const params = useParams();
    const history = useHistory();
    const confirm = useConfirm();
    const [open, setOpen] = React.useState(false);
    const [errorType, setErrorType] = useState("info");
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


    const getAllUsers = () => {
        axios.get("https://localhost:5000/users").then((res) => {
            if (res.status === 200) {
                setUsers(res.data.filter(n => n._id !== "000000000000000000000000"));
            } else {
                alert("Błąd ładowania danych");
            }
        });
    };

    const handleDelete = (values) => {
        confirm({
            title: "Czy na pewno chcesz usnunąć tego użytkownika?",
            confirmationText: "Usuń użytkownika",
            cancellationText: "Anuluj"
        }).then(() => {
            axios
                .delete(`https://localhost:5000/users/deleteUser/${values}`)
                .then((res) => {
                    if (res.status === 200) {
                        setAlertMessage("Udało się usunąć użytkownika");
                        setErrorType("success");
                        setUsers(users.filter((n) => n._id !== values));
                        handleClick();
                    } else {
                        setAlertMessage("Nie udało się usunąć użytkownika");
                        setErrorType("error");
                        handleClick();
                    }
                });
        }).catch(() => {
        });
    };

    useEffect(() => {
        getAllUsers();
    }, []);

    return (<div className={"auction-list"}>
        <h3>Zarządzanie kontami</h3>
        <NavbarLogged/>
        <div className={"buttons"}>
            <Stack direction={"row"} spacing={"4px"} justifyContent={"center"}>
                <Button variant={"outlined"} onClick={() => getAllUsers()}>Odśwież</Button>
                <Button variant={"outlined"} onClick={() => history.goBack()}>
                    Powrót
                </Button>
            </Stack>
        </div>
        <div className={"items"}>
            {users.length > 0 && users.map(n => <div key={n._id} className={"space-bet"}>
                <p className={"chatroom"}
                   onClick={() => history.push(`/logged/${params.id}/user/${n._id}`)}>{n.login}</p>
                <div className={"buttons"}>
                    <Button variant={"text"} onClick={() => {
                        history.push(`/logged/${params.id}/accountManagement/${n._id}/editAccount`)
                    }}>Edytuj użytkownika</Button>
                    <Button variant={"text"} onClick={() => {
                        handleDelete(n._id);
                    }}>Usuń użytkownika</Button>
                </div>
            </div>)}
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

export default AccountManagement;
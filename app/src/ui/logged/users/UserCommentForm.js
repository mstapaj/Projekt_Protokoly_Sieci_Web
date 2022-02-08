import axios from "axios";
import {useHistory, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import Box from "@mui/material/Box";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Snackbar,
    Stack
} from "@mui/material";
import TextField from "@mui/material/TextField";
import Notification from "../Notification";

const UserCommentForm = () => {
    const params = useParams();
    const history = useHistory();
    const [comment, setComment] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [open, setOpen] = useState(false);
    const [opinionType, setOpinionType] = useState(true);

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
        comment: "", type: true, author: params.id, user: params.userId
    });

    const handleSubmit = () => {
        if (comment.length < 1) {
            setAlertMessage("Komentarz musi zawierać jakąś treść.");
            handleClick();
        } else if (comment.length > 200) {
            setAlertMessage("Komentarz jest za długi. Maksymalnie 200 znaków.");
            handleClick();
        } else if (opinionType === null) {
            setAlertMessage("Wybierz rodzaj komentarza");
            handleClick();
        } else {
            const preparedData = {...init, comment: comment, type: opinionType};
            if (params.userCommentId) {
                axios
                    .put("https://localhost:5000/userComments/editUserComment", preparedData)
                    .then((res) => {
                        if (res.status === 200) {
                            handleClickOpen();
                        } else {
                            setAlertMessage("Nie udało się edytować komentarza");
                            handleClick();
                        }
                    });
            } else {
                axios
                    .post("https://localhost:5000/userComments/addUserComment", preparedData)
                    .then((res) => {
                        if (res.status === 200) {
                            handleClickOpen();
                        } else {
                            setAlertMessage("Nie udało się dodać komentarza");
                            handleClick();
                        }
                    });
            }
        }

    };

    useEffect(() => {
        if (params.userCommentId) {
            axios
                .get(`https://localhost:5000/userComments/${params.userCommentId}`)
                .then((res) => {
                    if (res.status === 200) {
                        setInit(res.data);
                        setComment(res.data.comment);
                        setOpinionType(res.data.type);
                    } else {
                        setAlertMessage("Błąd pobierania danych z serwera");
                        handleClick();
                    }
                });
        }
    }, []);

    return (<div className={"login"}>
        <div className={"form"}>
            {(params.userCommentId) ? <h3>Edytuj komentarz</h3> : <h3>Dodaj komentarz</h3>}
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
                        label="Komentarz"
                        name={"comment"}
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                    />
                </Stack>
                <Stack marginLeft={"8px"}>
                    <FormControl>
                        <InputLabel id="demo-simple-select-label">Rodzaj komentarza</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            defaultValue={(opinionType) ? opinionType : true}
                            label="Rodzaj komentarza"
                            onChange={(event) => setOpinionType(event.target.value)}
                            style={{maxWidth: "225px", maxHeight: "56px", minWidth: "225px", minHeight: "56px"}}
                        >
                            <MenuItem value={true}>Pozytywny</MenuItem>
                            <MenuItem value={false}>Negatywny</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
                <Stack
                    spacing={2}
                    direction="row"
                    justifyContent={"center"}
                    marginTop={"10px"}
                >
                    <Button variant={"text"} type={"button"} onClick={() => history.goBack()}>Powrót</Button>
                    {(params.userCommentId) ?
                        <Button variant={"outlined"} onClick={() => handleSubmit()}>Edytuj komentarz</Button> :
                        <Button variant={"outlined"} onClick={() => handleSubmit()}>Dodaj komentarz</Button>}
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
                    {(params.userCommentId) ? "Udało się edytowac komentarz" : "Udało się dodać komentarz"}
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => history.goBack()}>Powrót</Button>
                </DialogActions>
            </Dialog>
        </div>
        <Notification />
    </div>);
};

export default UserCommentForm;

import axios from "axios";
import { useHistory, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import Notification from "../Notification";
import SnackbarComponent from "../../SnackbarComponent";
import DialogComponent from "../../DialogComponent";

const AuctionCommentForm = () => {
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
        comment: "",
        type: true,
        author: params.id,
        auction: params.auctionId,
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
            const preparedData = {
                ...init,
                comment: comment,
                type: opinionType,
            };
            if (params.auctionCommentId) {
                axios
                    .put(
                        "https://localhost:5000/auctionComments/editAuctionComment",
                        preparedData
                    )
                    .then((res) => {
                        if (res.status === 200) {
                            handleClickOpen();
                        } else {
                            setAlertMessage(
                                "Nie udało się edytować komentarza"
                            );
                            handleClick();
                        }
                    });
            } else {
                axios
                    .post(
                        "https://localhost:5000/auctionComments/addAuctionComment",
                        preparedData
                    )
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
        if (params.auctionCommentId) {
            axios
                .get(
                    `https://localhost:5000/auctionComments/${params.auctionCommentId}`
                )
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

    return (
        <div className={"login"}>
            <div className={"form"}>
                {params.auctionCommentId ? (
                    <h3>Edytuj komentarz</h3>
                ) : (
                    <h3>Dodaj komentarz</h3>
                )}
                <Box
                    component="form"
                    sx={{
                        "& .MuiTextField-root": { m: 1, width: "25ch" },
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
                            <InputLabel id="demo-simple-select-label">
                                Rodzaj komentarza
                            </InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                defaultValue={opinionType ? opinionType : true}
                                label="Rodzaj komentarza"
                                onChange={(event) =>
                                    setOpinionType(event.target.value)
                                }
                                style={{
                                    maxWidth: "225px",
                                    maxHeight: "56px",
                                    minWidth: "225px",
                                    minHeight: "56px",
                                }}
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
                        <Button
                            variant={"text"}
                            type={"button"}
                            onClick={() => history.goBack()}
                        >
                            Powrót
                        </Button>
                        {params.auctionCommentId ? (
                            <Button
                                variant={"outlined"}
                                onClick={() => handleSubmit()}
                            >
                                Edytuj komentarz
                            </Button>
                        ) : (
                            <Button
                                variant={"outlined"}
                                onClick={() => handleSubmit()}
                            >
                                Dodaj komentarz
                            </Button>
                        )}
                    </Stack>
                    <SnackbarComponent
                        alertMessage={alertMessage}
                        errorType={"error"}
                        handleClose={handleClose}
                        open={open}
                    />
                </Box>
                <DialogComponent
                    title={
                        params.auctionCommentId
                            ? "Udało się edytowac komentarz"
                            : "Udało się dodać komentarz"
                    }
                    openDialog={openDialog}
                    handleCloseDialog={handleCloseDialog}
                    firstButtonAction={() => history.goBack()}
                    firstButtonDesc={"Powrót"}
                />
            </div>
            <Notification />
        </div>
    );
};

export default AuctionCommentForm;

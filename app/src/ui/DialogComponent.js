import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import React from "react";

const DialogComponent = ({
    openDialog,
    handleCloseDialog,
    title,
    desc,
    firstButtonAction,
    secondButtonAction,
    firstButtonDesc,
    secondButtonDesc,
}) => {
    return (
        <Dialog
            position={"absolute"}
            open={openDialog}
            onClose={handleCloseDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{title}</DialogTitle>

            {desc && (
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {desc}
                    </DialogContentText>
                </DialogContent>
            )}
            <DialogActions>
                <Button onClick={firstButtonAction}>{firstButtonDesc}</Button>
                <Button onClick={secondButtonAction}>{secondButtonDesc}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default DialogComponent;

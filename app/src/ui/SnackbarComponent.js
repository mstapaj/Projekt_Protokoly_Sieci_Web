import { Alert, Snackbar } from "@mui/material";
import React from "react";

const SnackbarComponent = ({ alertMessage, errorType, open, handleClose }) => {
    return (
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
            <Alert
                onClose={handleClose}
                severity={errorType}
                sx={{ width: "100%" }}
            >
                {alertMessage}
            </Alert>
        </Snackbar>
    );
};

export default SnackbarComponent;

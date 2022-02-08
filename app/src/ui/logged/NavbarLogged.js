import {useState} from "react";
import {Button, Menu, MenuItem, Stack} from "@mui/material";
import {useHistory, useParams} from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";


const NavbarLogged = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const [anchorEl2, setAnchorEl2] = useState(null);
    const open2 = Boolean(anchorEl2);
    const handleClick2 = (event) => {
        setAnchorEl2(event.currentTarget);
    };
    const handleClose2 = () => {
        setAnchorEl2(null);
    };
    const [anchorEl3, setAnchorEl3] = useState(null);
    const open3 = Boolean(anchorEl3);
    const handleClick3 = (event) => {
        setAnchorEl3(event.currentTarget);
    };
    const handleClose3 = () => {
        setAnchorEl3(null);
    };
    const [anchorEl4, setAnchorEl4] = useState(null);
    const open4 = Boolean(anchorEl4);
    const handleClick4 = (event) => {
        setAnchorEl4(event.currentTarget);
    };
    const handleClose4 = () => {
        setAnchorEl4(null);
    };
    const params = useParams();
    const history = useHistory();

    return (<div className={"navbar"}>
        <Stack direction={"row"} spacing={"4px"} justifyContent={"center"}>
            <Button
                id="basic-button"
                aria-controls={open ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
                variant={"outlined"}
            >
                Aukcje
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    "aria-labelledby": "basic-button"
                }}
            >
                <MenuItem onClick={() => history.push(`/logged/${params.id}/myAuctions`)}>Moje aukcje</MenuItem>
                <MenuItem onClick={() => history.push(`/logged/${params.id}/addAuction`)}>Dodaj aukcje</MenuItem>
                <MenuItem onClick={() => history.push(`/logged/${params.id}/allAuctions`)}>Wszystkie aukcje</MenuItem>
            </Menu>
            <Button
                id="basic-button"
                aria-controls={open2 ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open2 ? "true" : undefined}
                onClick={handleClick2}
                variant={"outlined"}
            >
                Konto
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl2}
                open={open2}
                onClose={handleClose2}
                MenuListProps={{
                    "aria-labelledby": "basic-button"
                }}
            >
                <MenuItem onClick={() => history.push(`/logged/${params.id}/user/${params.id}`)}>Mój profil</MenuItem>
                <MenuItem onClick={() => history.push(`/logged/${params.id}/changePassword`)}>Zmień hasło</MenuItem>
                <MenuItem onClick={() => history.push(`/logged/${params.id}/deleteAccount`)}>Usuń konto</MenuItem>
                <MenuItem onClick={() => {
                    Cookies.remove("AuctionPageSavedLogin");
                    axios.post(`https://localhost:5000/users/logout/${params.id}`);
                    history.push("/");
                }}>Wyloguj</MenuItem>

            </Menu>
            <Button
                id="basic-button"
                aria-controls={open3 ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open3 ? "true" : undefined}
                onClick={handleClick3}
                variant={"outlined"}
            >
                Czaty
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl3}
                open={open3}
                onClose={handleClose3}
                MenuListProps={{
                    "aria-labelledby": "basic-button"
                }}
            >
                <MenuItem onClick={() => history.push(`/logged/${params.id}/chats`)}>Pokoje czatów</MenuItem>
                <MenuItem onClick={() => history.push(`/logged/${params.id}/myDMChats`)}>Prywatne czaty</MenuItem>
            </Menu>
            {params.id && params.id === "000000000000000000000000" && <Button
                id="basic-button"
                aria-controls={open4 ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open4 ? "true" : undefined}
                onClick={handleClick4}
                variant={"outlined"}
            >
                Panel administratora
            </Button>}
            {params.id && params.id === "000000000000000000000000" && <Menu
                id="basic-menu"
                anchorEl={anchorEl4}
                open={open4}
                onClose={handleClose4}
                MenuListProps={{"aria-labelledby": "basic-button"}}
            >
                <MenuItem onClick={() => history.push(`/logged/${params.id}/accountManagement`)}>Zarządzanie
                    kontami</MenuItem>
                <MenuItem onClick={() => history.push(`/logged/${params.id}/auctionsManagement`)}>Zarządzanie
                    aukcjami</MenuItem>
                <MenuItem onClick={() => history.push(`/logged/${params.id}/chats`)}>Zarządzanie czatami</MenuItem>
            </Menu>}
        </Stack>
    </div>);
};

export default NavbarLogged;
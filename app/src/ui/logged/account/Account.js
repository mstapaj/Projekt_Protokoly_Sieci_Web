import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import NavbarLogged from "../NavbarLogged";
import Notification from "../Notification";

const Account = () => {
    const params = useParams();
    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get(`https://localhost:5000/users/${params.id}`).then((res) => {
            setData(res.data);
        });
    }, []);

    return (
        <div className={"main"}>
            <h3>Witaj {data.login}</h3>
            <NavbarLogged />
            <Notification />
        </div>
    );
};

export default Account;

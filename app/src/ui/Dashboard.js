import { useHistory } from "react-router-dom";
import { useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import Navbar from "./Navbar";

const Dashboard = () => {
    const history = useHistory();

    useEffect(() => {
        let savedLogin = Cookies.get("AuctionPageSavedLogin");
        if (savedLogin) {
            axios
                .post("https://localhost:5000/users/login", {
                    login: savedLogin.split("/")[0],
                    password: savedLogin.split("/")[1],
                })
                .then((res) => {
                    if (res.status === 200) {
                        if (res.data) {
                            history.push(`/logged/${res.data._id}`);
                        }
                    } else {
                        alert("Nie udało się zalogować. Błąd serwera");
                    }
                });
        }
    }, []);

    return (
        <div className={"main"}>
            <h3>Strona główna</h3>
            <Navbar />
        </div>
    );
};

export default Dashboard;

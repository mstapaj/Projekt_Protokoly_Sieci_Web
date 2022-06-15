const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Auction = require("../models/Auction");
const AuctionComment = require("../models/AuctionComment");
const UserComment = require("../models/UserComment");
const ChatRoom = require("../models/ChatRoom");
const fs = require("fs");
const mqtt = require("mqtt");
const CryptoJS = require("crypto-js");
const keyEncrypt = require("../keyEncrypt.json").key;
const client = mqtt.connect("mqtt://127.0.0.1:1883", {
    connectTimeout: 5000,
    path: "/mqtt",
});

router.get("/", async (req, res) => {
    try {
        const data = await User.find({});
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.get("/logins", async (req, res) => {
    try {
        const data = await User.find({});
        const logins = await data.map((n) => n.login);
        res.status(200).send(logins);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const data = await User.findById(id)
            .populate("comments")
            .populate("auctions");
        res.status(200).send({
            ...data._doc,
            password: CryptoJS.AES.decrypt(data.password, keyEncrypt).toString(
                CryptoJS.enc.Utf8
            ),
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.get("/auctions/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const data = await User.findById(id).populate("auctions");
        res.status(200).send(data.auctions);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.post("/login", async (req, res) => {
    try {
        const dateTime = new Date();
        const data = await User.find({login: req.body.login});
        if (data.length !== 0) {
            if (
                CryptoJS.AES.decrypt(data[0].password, keyEncrypt).toString(
                    CryptoJS.enc.Utf8
                ) === req.body.password
            ) {
                fs.appendFileSync(
                    "./logs/logs.log",
                    `\n[${dateTime.toLocaleString()}] :: Zalogował się użytkownik login:${
                        req.body.login
                    }`
                );
                return res.status(200).send(data[0]);
            } else {
                fs.appendFileSync(
                    "./logs/logs.log",
                    `\n[${dateTime.toLocaleString()}] :: Nieudana próba logowania login:${
                        req.body.login
                    }`
                );
                return res.status(200).send(null);
            }
        } else {
            fs.appendFileSync(
                "./logs/logs.log",
                `\n[${dateTime.toLocaleString()}] :: Nieudana próba logowania login:${
                    req.body.login
                }`
            );
            return res.status(200).send(null);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.post("/register", async (req, res) => {
    try {
        const data = req.body;
        const newUser = new User({
            login: data.login,
            password: CryptoJS.AES.encrypt(
                data.password,
                keyEncrypt
            ).toString(),
        });
        await newUser.save();
        const dateTime = new Date();
        fs.appendFileSync(
            "./logs/logs.log",
            `\n[${dateTime.toLocaleString()}] :: Zarejstrował się użytkownik login:${
                req.body.login
            }`
        );
        client.publish("updateSubscribers", "updateSubscribers");
        return res.status(200).send(true);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.put("/changePassword", async (req, res) => {
    try {
        const dateTime = new Date();
        const data = req.body;
        const account = await User.findById(data.id);
        if (
            CryptoJS.AES.decrypt(account.password, keyEncrypt).toString(
                CryptoJS.enc.Utf8
            ) === data.oldPassword
        ) {
            await User.findByIdAndUpdate(data.id, {
                password: CryptoJS.AES.encrypt(
                    data.newPassword,
                    keyEncrypt
                ).toString(),
            });
            fs.appendFileSync(
                "./logs/logs.log",
                `\n[${dateTime.toLocaleString()}] :: Użytkownik ${
                    account.login
                } zmienił hasło`
            );
            return res.status(200).send(true);
        } else {
            return res.status(200).send(false);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.post("/deleteAccount", async (req, res) => {
    try {
        const dateTime = new Date();
        const data = req.body;
        const account = await User.findById(data.id);
        if (
            CryptoJS.AES.decrypt(account.password, keyEncrypt).toString(
                CryptoJS.enc.Utf8
            ) === data.password
        ) {
            await Auction.deleteMany({
                user: account._id,
            });
            await AuctionComment.deleteMany({
                author: account._id,
            });
            await UserComment.deleteMany({
                author: account._id,
            });
            await ChatRoom.deleteMany({
                author: account._id,
            });
            await await User.findByIdAndDelete(data.id);
            fs.appendFileSync(
                "./logs/logs.log",
                `\n[${dateTime.toLocaleString()}] :: Konto użytkownika ${
                    account.login
                } zostało usunięte, użytkownik został automatycznie wylogowany`
            );
            client.publish("updateSubscribers", "updateSubscribers");
            return res.status(200).send(true);
        } else {
            fs.appendFileSync(
                "./logs/logs.log",
                `\n[${dateTime.toLocaleString()}] :: Nieudana próba usunięcia użytkownika ${
                    account.login
                }`
            );
            return res.status(200).send(false);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.post("/logout/:id", async (req, res) => {
    try {
        const dateTime = new Date();
        const user = await User.findById(req.params.id);
        fs.appendFileSync(
            "./logs/logs.log",
            `\n[${dateTime.toLocaleString()}] :: Użytkownik ${
                user.login
            } wylogował się`
        );
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.delete("/deleteUser/:id", async (req, res) => {
    try {
        const dateTime = new Date();
        const data = req.params;
        const account = await User.findById(data.id);
        await Auction.deleteMany({
            user: account._id,
        });
        await AuctionComment.deleteMany({
            author: account._id,
        });
        await UserComment.deleteMany({
            author: account._id,
        });
        await ChatRoom.deleteMany({
            author: account._id,
        });
        await await User.findByIdAndDelete(data.id);
        fs.appendFileSync(
            "./logs/logs.log",
            `\n[${dateTime.toLocaleString()}] :: Konto użytkownika ${
                account.login
            } zostało usunięte przez administratora`
        );
        client.publish("updateSubscribers", "updateSubscribers");
        return res.status(200).send(true);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.put("/editAccount/:id", async (req, res) => {
    try {
        const dateTime = new Date();
        const data = req.body;
        const account = await User.findById(req.params.id);
        await User.findByIdAndUpdate(req.params.id, {
            login: data.login,
            password: CryptoJS.AES.encrypt(
                data.password,
                keyEncrypt
            ).toString(),
        });
        fs.appendFileSync(
            "./logs/logs.log",
            `\n[${dateTime.toLocaleString()}] :: Administrator zmienił login użytkownika ${
                account.login
            } ma ${data.login} oraz zmienił hasło `
        );
        return res.status(200).send(true);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

module.exports = router;

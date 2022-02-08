const express = require("express");
const router = express.Router();
const Auction = require("../models/Auction");
const AuctionComment = require("../models/AuctionComment");
const User = require("../models/User");
const fs = require("fs");
const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://127.0.0.1:1883", {
    connectTimeout: 5000,
    path: "/mqtt",
});

router.get("/", async (req, res) => {
    try {
        const data = await Auction.find({});
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.get("/search/:word", async (req, res) => {
    try {
        const data = await Auction.find({
            name: { $regex: req.params.word, $options: "i" },
        });
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Auction.findById(id)
            .populate("user")
            .populate("comments");
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.post("/addAuction", async (req, res) => {
    try {
        const dateTime = new Date();
        const data = req.body;
        const user = await User.findById(data.user);
        const newAuction = new Auction({
            name: data.name,
            description: data.description,
            price: data.price,
            amount: data.amount,
            user: user._id,
            watchers: "",
        });
        await newAuction.save();
        await User.findByIdAndUpdate(user._id, {
            auctions: [...user.auctions, newAuction._id],
        });
        fs.appendFileSync(
            "./logs/logs.log",
            `\n[${dateTime.toLocaleString()}] :: Dodanie aukcji ${
                data.name
            }, opis:${data.description}, cena:${data.price}, ilość:${
                data.amount
            }, przez użytkownika ${user.login}`
        );
        client.publish("updateSubscribers", "updateSubscribers");
        return res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.put("/editAuction", async (req, res) => {
    try {
        const dateTime = new Date();
        const id = req.body._id;
        const oldAuction = await Auction.findById(id).populate("user");
        await Auction.findByIdAndUpdate(id, req.body);
        fs.appendFileSync(
            "./logs/logs.log",
            `\n[${dateTime.toLocaleString()}] :: Edycja aukcji ${
                oldAuction.name
            }, opis:${oldAuction.description}, cena:${
                oldAuction.price
            }, ilość:${oldAuction.amount}, przez użytkownika ${
                oldAuction.user.login
            }, nowa aukcja ${req.body.name},opis:${
                req.body.description
            }, cena:${req.body.price}, ilość:${req.body.amount}`
        );
        return res.status(200).send(id);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.delete("/deleteAuction/:auctionId", async (req, res) => {
    try {
        const dateTime = new Date();
        const id = req.params.auctionId;
        const auction = await Auction.findById(id);
        await Auction.findByIdAndDelete(id);
        const user = await User.findById(auction.user);
        await AuctionComment.deleteMany({
            auction: auction._id,
        });
        await User.findByIdAndUpdate(auction.user, {
            auctions: user.auctions.filter(
                (n) => n.toString() !== id.toString()
            ),
        });
        fs.appendFileSync(
            "./logs/logs.log",
            `\n[${dateTime.toLocaleString()}] :: Usunięcie aukcji ${
                auction.name
            }, opis:${auction.description}, cena:${auction.price}, ilość:${
                auction.amount
            }, przez użytkownika ${user.login}`
        );
        client.publish("updateSubscribers", "updateSubscribers");
        return res.status(200).send(id);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

module.exports = router;

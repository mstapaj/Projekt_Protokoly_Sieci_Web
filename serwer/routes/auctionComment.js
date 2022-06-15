const express = require("express");
const router = express.Router();
const Auction = require("../models/Auction");
const User = require("../models/User");
const AuctionComment = require("../models/AuctionComment");
const fs = require("fs");
const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://127.0.0.1:1883", {
    connectTimeout: 5000,
    path: "/mqtt",
});

router.get("/", async (req, res) => {
    try {
        const data = await AuctionComment.find({});
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const data = await AuctionComment.findById(id);
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.post("/addAuctionComment", async (req, res) => {
    try {
        const dateTime = new Date();
        const data = req.body;
        const user = await User.findById(data.author);
        const auction = await Auction.findById(data.auction);
        const newAuctionComment = new AuctionComment({
            comment: data.comment,
            type: data.type,
            author: data.author,
            auction: data.auction,
        });
        await newAuctionComment.save();
        await User.findByIdAndUpdate(user._id, {
            writtenAuctionComments: [
                ...user.writtenAuctionComments,
                newAuctionComment._id,
            ],
        });
        await Auction.findByIdAndUpdate(auction._id, {
            comments: [...auction.comments, newAuctionComment._id],
        });
        fs.appendFileSync(
            "./logs/logs.log",
            `\n[${dateTime.toLocaleString()}] :: Użytkownik ${
                user.login
            } dodał komentarz o treści ${data.comment} do aukcji ${
                auction.name
            }`
        );
        client.publish("updateSubscribers", "updateSubscribers");
        return res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.put("/editAuctionComment", async (req, res) => {
    try {
        const dateTime = new Date();
        const id = req.body._id;
        const oldComment = await AuctionComment.findById(id)
            .populate("author")
            .populate("auction");
        await AuctionComment.findByIdAndUpdate(id, req.body);

        fs.appendFileSync(
            "./logs/logs.log",
            `\n[${dateTime.toLocaleString()}] :: Użytkownik ${
                oldComment.author.login
            } zmienił komentarz o treści ${oldComment.comment} na ${
                req.body.comment
            } w aukcji ${oldComment.auction.name}`
        );
        return res.status(200).send(id);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.delete("/deleteAuctionComment/:auctionCommentId", async (req, res) => {
    try {
        const dateTime = new Date();
        const id = req.params.auctionCommentId;
        const auctionComment = await AuctionComment.findById(id);
        await AuctionComment.findByIdAndDelete(id);
        const user = await User.findById(auctionComment.author);
        const auction = await Auction.findById(auctionComment.auction);
        await User.findByIdAndUpdate(auctionComment.author, {
            writtenAuctionComments: user.writtenAuctionComments.filter(
                (n) => n.toString() !== id.toString()
            ),
        });
        await Auction.findByIdAndUpdate(
            auctionComment.auction,
            {
                comments: auction.comments.filter(
                    (n) => n.toString() !== id.toString()
                ),
            }
        );
        fs.appendFileSync(
            "./logs/logs.log",
            `\n[${dateTime.toLocaleString()}] :: Użytkownik ${
                user.login
            } usunął komentarz o treści ${auctionComment.comment} w aukcji ${
                auction.name
            }`
        );
        client.publish("updateSubscribers", "updateSubscribers");
        return res.status(200).send(id);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

module.exports = router;

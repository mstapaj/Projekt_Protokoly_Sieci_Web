const express = require("express");
const router = express.Router();
const User = require("../models/User");
const UserComment = require("../models/UserComment");
const fs = require("fs");
const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://127.0.0.1:1883", {
    connectTimeout: 5000,
    path: "/mqtt",
});

router.get("/", async (req, res) => {
    try {
        const data = await UserComment.find({});
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const data = await UserComment.findById(id);
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.post("/addUserComment", async (req, res) => {
    try {
        const dateTime = new Date();
        const data = req.body;
        const author = await User.findById(data.author);
        const user = await User.findById(data.user);
        const newUserComment = new UserComment({
            comment: data.comment,
            type: data.type,
            author: data.author,
            user: data.user,
        });
        await newUserComment.save();
        await User.findByIdAndUpdate(author._id, {
            writtenUserComments: [
                ...author.writtenUserComments,
                newUserComment._id,
            ],
        });
        await User.findByIdAndUpdate(user._id, {
            comments: [...user.comments, newUserComment._id],
        });
        fs.appendFileSync(
            "./logs/logs.log",
            `\n[${dateTime.toLocaleString()}] :: Użytkownik ${
                author.login
            } dodał komentarz o treści ${data.comment} do użytkownika ${
                user.login
            }`
        );
        client.publish("updateSubscribers", "updateSubscribers");
        return res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.put("/editUserComment", async (req, res) => {
    try {
        const dateTime = new Date();
        const id = req.body._id;
        const commentOld = await UserComment.findById(id)
            .populate("author")
            .populate("user");
        await UserComment.findByIdAndUpdate(id, req.body);
        fs.appendFileSync(
            "./logs/logs.log",
            `\n[${dateTime.toLocaleString()}] :: Użytkownik ${
                commentOld.author.login
            } zmienił komentarz o treści ${commentOld.comment} na ${
                req.body.comment
            } u użytkownika ${commentOld.user.login}`
        );
        return res.status(200).send(id);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.delete("/deleteUserComment/:userCommentId", async (req, res) => {
    try {
        const dateTime = new Date();
        const id = req.params.userCommentId;
        const userComment = await UserComment.findById(id);
        await UserComment.findByIdAndDelete(id);
        const author = await User.findById(userComment.author);
        const user = await User.findById(userComment.user);
        await User.findByIdAndUpdate(userComment.author, {
            writtenUserComments: author.writtenUserComments.filter(
                (n) => n.toString() !== id.toString()
            ),
        });
        await User.findByIdAndUpdate(userComment.user, {
            comments: user.comments.filter(
                (n) => n.toString() !== id.toString()
            ),
        });
        fs.appendFileSync(
            "./logs/logs.log",
            `\n[${dateTime.toLocaleString()}] :: Użytkownik ${
                author.login
            } usunął komentarz o treści ${userComment.comment} u użytkownika ${
                user.login
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

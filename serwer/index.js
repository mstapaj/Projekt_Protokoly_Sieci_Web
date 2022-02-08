const express = require("express");
const https = require("https");
const fs = require("fs");
const app = express();
const users = require("./routes/users");
const auctions = require("./routes/auctions");
const auctionComments = require("./routes/auctionComment");
const userComments = require("./routes/userComment");
const cors = require("cors");
const mqtt = require("mqtt");
const ChatRoom = require("./models/ChatRoom");
const DMChat = require("./models/DMChat");
const mongoose = require("mongoose");
const User = require("./models/User");
const AuctionComment = require("./models/AuctionComment");
const UserComment = require("./models/UserComment");
const Auction = require("./models/Auction");
const CryptoJS = require("crypto-js");
const keyEncrypt = require("./keyEncrypt.json").key;

app.use(express.json());
app.use(
    cors({
        origin: "https://localhost:3000",
        methods: ["GET", "POST", "DELETE", "UPDATE", "PUT"],
    })
);

const options = {
    key: fs.readFileSync("./.cert/plik_klucz_bez_hasla"),
    cert: fs.readFileSync("./.cert/plik_certyfikat"),
};

app.use("/users", users);
app.use("/auctions", auctions);
app.use("/auctionComments", auctionComments);
app.use("/userComments", userComments);

require("dotenv").config();
const dbConnData = {
    host: process.env.MONGO_HOST || "127.0.0.1",
    port: process.env.MONGO_PORT || 27017,
    database: process.env.MONGO_DATABASE || "local",
};

mongoose
    .connect(
        `mongodb://${dbConnData.host}:${dbConnData.port}/${dbConnData.database}`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(async (response) => {
        console.log(
            `Connected to MongoDB. Database name: "${response.connections[0].name}"`
        );
        const port = process.env.PORT || 5000;
        https.createServer(options, app).listen(port, () => {
            console.log(`API server listening at https://localhost:${port}`);
        });
        const admins = await User.find({ login: "administrator" });
        if (admins.length === 0) {
            const newUser = new User({
                _id: "000000000000000000000000",
                login: "administrator",
                password: CryptoJS.AES.encrypt(
                    "s3cr3tpassword",
                    keyEncrypt
                ).toString(),
            });
            await newUser.save();
        }
    })
    .catch((error) => console.error("Error connecting to MongoDB", error));

const client = mqtt.connect("mqtt://127.0.0.1:1883", {
    connectTimeout: 5000,
    path: "/mqtt",
});

let chatRooms;
let DMChats;
let usersLikes;
let userCommentsLikes;
let auctionCommentsLikes;
let auctionWatchers;

async () => {
    chatRooms = await ChatRoom.find({});
    DMChats = await DMChats.find({});
    usersLikes = await User.find({});
    userCommentsLikes = await UserComment.find({});
    auctionCommentsLikes = await AuctionComment.find({});
    auctionWatchers = await Auction.find({});
};

const updateSubscribers = async () => {
    chatRooms = await ChatRoom.find({});
    for (let i = 0; i < chatRooms.length; i++) {
        client.subscribe(chatRooms[i].name);
    }
    DMChats = await DMChat.find({});
    for (let i = 0; i < DMChats.length; i++) {
        client.subscribe(DMChats[i].name);
    }
    usersLikes = await User.find({});
    for (let i = 0; i < usersLikes.length; i++) {
        client.subscribe(usersLikes[i]._id.toString());
    }
    userCommentsLikes = await UserComment.find({});
    for (let i = 0; i < userCommentsLikes.length; i++) {
        client.subscribe(userCommentsLikes[i]._id.toString());
    }
    auctionCommentsLikes = await AuctionComment.find({});
    for (let i = 0; i < auctionCommentsLikes.length; i++) {
        client.subscribe(auctionCommentsLikes[i]._id.toString());
    }
    auctionWatchers = await Auction.find({});
    for (let i = 0; i < auctionWatchers.length; i++) {
        client.subscribe(auctionWatchers[i]._id.toString());
    }
};

const sendChatRooms = async () => {
    chatRooms = await ChatRoom.find({});
    const preparedChatRooms = chatRooms.reduce((acc, curr) => {
        return acc + curr.name.toString() + ":" + curr.author.toString() + "~";
    }, "");
    client.publish("chatRooms", preparedChatRooms);
};

const sendDMChats = async () => {
    DMChats = await DMChat.find({});
    const preparedDMChats = DMChats.reduce((acc, curr) => {
        return acc + curr.name.toString() + "~";
    }, "");
    client.publish("DMChats", preparedDMChats);
};

client.on("connect", async () => {
    console.log("Connected to HiveMQ");
    client.subscribe("updateSubscribers");
    client.subscribe("chatRooms");
    client.subscribe("addRoom");
    client.subscribe("addDM");
    client.subscribe("DMChats");
    updateSubscribers();
});
client.on("error", (err) => {
    console.error("Connection error: ", err);
    client.end();
});
client.on("reconnect", () => {
    console.log("Reconnecting");
});
client.on("message", async (topic, message) => {
    const payload = { topic, message: message.toString() };
    if (payload.topic === "chatRooms" && payload.message === "getRooms") {
        sendChatRooms();
    } else if (
        payload.topic === "updateSubscribers" &&
        payload.message === "updateSubscribers"
    ) {
        updateSubscribers();
    } else if (payload.topic === "addRoom") {
        const author = await User.findById(payload.message.split("~")[1]);
        const newChatRoom = new ChatRoom({
            name: payload.message.split("~")[0],
            author: payload.message.split("~")[1],
        });
        await User.findByIdAndUpdate(payload.message.split("~")[1], {
            chats: [...author.chats, newChatRoom._id],
        });
        await newChatRoom.save();
        const dateTime = new Date();
        fs.appendFileSync(
            "./logs/logsChatRooms.log",
            `\n[${dateTime.toLocaleString()}] :: Pokój ${
                payload.message.split("~")[0]
            } został stworzony przez ${author.login}`
        );
        client.subscribe(payload.message);
        updateSubscribers();
        sendChatRooms();
    } else if (payload.topic === "addDM") {
        const newDMChat = new DMChat({
            name: payload.message,
        });
        await newDMChat.save();
        const firstUser = await User.findById(payload.message.split(":")[0]);
        const secondUser = await User.findById(payload.message.split(":")[1]);
        const dateTime = new Date();
        fs.appendFileSync(
            "./logs/logsDMChat.log",
            `\n[${dateTime.toLocaleString()}] :: Rozpoczęcie rozmowy między ${
                firstUser.login
            } i ${secondUser.login}`
        );
        client.subscribe(payload.message);
        sendDMChats();
    } else if (payload.topic === "DMChats" && payload.message === "getDM") {
        sendDMChats();
    } else if (
        (await auctionWatchers.map((n) => n._id.toString())).includes(
            payload.topic
        )
    ) {
        if (payload.message.slice(0, 2) === "+W") {
            const auc = await Auction.findById(payload.topic);
            if (
                auc.watchers
                    .split("~")
                    .includes(payload.message.slice(2).toString())
            ) {
                await Auction.findByIdAndUpdate(payload.topic, {
                    views: parseInt(auc.views) + 1,
                });
                client.publish(payload.topic, "W" + auc.watchers);
                client.publish(
                    payload.topic,
                    "V" + `${parseInt(auc.views) + 1}`
                );
            } else {
                await Auction.findByIdAndUpdate(payload.topic, {
                    watchers:
                        auc.watchers +
                        "~" +
                        payload.message.slice(2).toString(),
                    views: parseInt(auc.views) + 1,
                });
                client.publish(
                    payload.topic,
                    "W" +
                        auc.watchers +
                        "~" +
                        payload.message.slice(2).toString()
                );
                client.publish(
                    payload.topic,
                    "V" + `${parseInt(auc.views) + 1}`
                );
            }
        } else if (payload.message.slice(0, 2) === "-W") {
            const auc = await Auction.findById(payload.topic);
            const preparedWatchers = auc.watchers
                .split("~")
                .filter((n) => n !== payload.message.slice(2))
                .filter((n) => n !== "")
                .reduce((acc, curr) => {
                    return acc + "~" + curr.toString();
                }, "");
            await Auction.findByIdAndUpdate(payload.topic, {
                watchers: preparedWatchers,
            });
            client.publish(payload.topic, "W" + preparedWatchers);
        } else if (payload.message.slice(0, 2) === "-A") {
            const dateTime = new Date();
            const auc = await Auction.findById(payload.topic);
            const buyer = await User.findById(payload.message.slice(2));
            await Auction.findByIdAndUpdate(payload.topic, {
                amount: parseInt(auc.amount) - 1,
            });
            client.publish(
                payload.topic,
                "A~" + `${parseInt(auc.amount) - 1}~${payload.message.slice(2)}`
            );
            fs.appendFileSync(
                `./logs/logs.log`,
                `\n[${dateTime.toLocaleString()}] :: Przedmiot ${
                    auc.name
                } został zakupiony przez użytkownika ${buyer.login}`
            );
        }
    } else if ((await DMChats.map((n) => n.name)).includes(payload.topic)) {
        if (payload.message === "~getMessages") {
            const messages = await DMChat.find({ name: payload.topic });
            const preparedMessages = messages[0].messages.reduce(
                (acc, curr) => {
                    return acc + curr + "~";
                },
                ""
            );
            client.publish("~" + payload.topic, preparedMessages);
        } else {
            const oldChatRoom = await DMChat.find({ name: payload.topic });
            await DMChat.findByIdAndUpdate(oldChatRoom[0]._id, {
                messages: [...oldChatRoom[0].messages, payload.message],
            });
            const firstUser = await User.findById(payload.topic.split(":")[0]);
            const secondUser = await User.findById(payload.topic.split(":")[1]);
            const dateTime = new Date();
            fs.appendFileSync(
                `./logs/DMChats/${firstUser.login}:${secondUser.login}.log`,
                `\n[${dateTime.toLocaleString()}] :: ${payload.message}`
            );
        }
    } else if (
        (await usersLikes.map((n) => n._id.toString())).includes(payload.topic)
    ) {
        if (payload.message.slice(0, 2) === "+L") {
            const user = await User.findById(payload.topic);
            await User.findByIdAndUpdate(payload.topic, {
                likes: user.likes + "~" + payload.message.slice(2),
            });
            client.publish(
                payload.topic,
                "L" + user.likes + "~" + payload.message.slice(2)
            );
        } else if (payload.message.slice(0, 2) === "-L") {
            const user = await User.findById(payload.topic);
            const preparedLikes = user.likes
                .split("~")
                .filter((n) => n !== "")
                .filter((n) => n !== payload.message.slice(2))
                .reduce((acc, curr) => {
                    return acc + "~" + curr;
                }, "");
            await User.findByIdAndUpdate(payload.topic, {
                likes: preparedLikes,
            });
            client.publish(payload.topic, "L" + preparedLikes);
        } else if (payload.message.slice(0, 2) === "+D") {
            const user = await User.findById(payload.topic);
            await User.findByIdAndUpdate(payload.topic, {
                dislikes: user.dislikes + "~" + payload.message.slice(2),
            });
            client.publish(
                payload.topic,
                "D" + user.dislikes + "~" + payload.message.slice(2)
            );
        } else if (payload.message.slice(0, 2) === "-D") {
            const user = await User.findById(payload.topic);
            const preparedLikes = user.dislikes
                .split("~")
                .filter((n) => n !== "")
                .filter((n) => n !== payload.message.slice(2))
                .reduce((acc, curr) => {
                    return acc + "~" + curr;
                }, "");
            await User.findByIdAndUpdate(payload.topic, {
                dislikes: preparedLikes,
            });
            client.publish(payload.topic, "D" + preparedLikes);
        } else if (payload.message === "GL") {
            const user = await User.findById(payload.topic);
            client.publish(payload.topic, "L" + user.likes);
            client.publish(payload.topic, "D" + user.dislikes);
        }
    } else if (
        (await userCommentsLikes.map((n) => n._id.toString())).includes(
            payload.topic
        )
    ) {
        if (payload.message.slice(0, 2) === "+L") {
            const user = await UserComment.findById(payload.topic);
            await UserComment.findByIdAndUpdate(payload.topic, {
                likes: user.likes + "~" + payload.message.slice(2),
            });
            client.publish(
                payload.topic,
                "L" + user.likes + "~" + payload.message.slice(2)
            );
        } else if (payload.message.slice(0, 2) === "-L") {
            const user = await UserComment.findById(payload.topic);
            const preparedLikes = user.likes
                .split("~")
                .filter((n) => n !== "")
                .filter((n) => n !== payload.message.slice(2))
                .reduce((acc, curr) => {
                    return acc + "~" + curr;
                }, "");
            await UserComment.findByIdAndUpdate(payload.topic, {
                likes: preparedLikes,
            });
            client.publish(payload.topic, "L" + preparedLikes);
        } else if (payload.message.slice(0, 2) === "+D") {
            const user = await UserComment.findById(payload.topic);
            await UserComment.findByIdAndUpdate(payload.topic, {
                dislikes: user.dislikes + "~" + payload.message.slice(2),
            });
            client.publish(
                payload.topic,
                "D" + user.dislikes + "~" + payload.message.slice(2)
            );
        } else if (payload.message.slice(0, 2) === "-D") {
            const user = await UserComment.findById(payload.topic);
            const preparedLikes = user.dislikes
                .split("~")
                .filter((n) => n !== "")
                .filter((n) => n !== payload.message.slice(2))
                .reduce((acc, curr) => {
                    return acc + "~" + curr;
                }, "");
            await UserComment.findByIdAndUpdate(payload.topic, {
                dislikes: preparedLikes,
            });
            client.publish(payload.topic, "D" + preparedLikes);
        } else if (payload.message === "GL") {
            const user = await UserComment.findById(payload.topic);
            client.publish(payload.topic, "L" + user.likes);
            client.publish(payload.topic, "D" + user.dislikes);
        }
    } else if (
        (await auctionCommentsLikes.map((n) => n._id.toString())).includes(
            payload.topic
        )
    ) {
        if (payload.message.slice(0, 2) === "+L") {
            const user = await AuctionComment.findById(payload.topic);
            await AuctionComment.findByIdAndUpdate(payload.topic, {
                likes: user.likes + "~" + payload.message.slice(2),
            });
            client.publish(
                payload.topic,
                "L" + user.likes + "~" + payload.message.slice(2)
            );
        } else if (payload.message.slice(0, 2) === "-L") {
            const user = await AuctionComment.findById(payload.topic);
            const preparedLikes = user.likes
                .split("~")
                .filter((n) => n !== "")
                .filter((n) => n !== payload.message.slice(2))
                .reduce((acc, curr) => {
                    return acc + "~" + curr;
                }, "");
            await AuctionComment.findByIdAndUpdate(payload.topic, {
                likes: preparedLikes,
            });
            client.publish(payload.topic, "L" + preparedLikes);
        } else if (payload.message.slice(0, 2) === "+D") {
            const user = await AuctionComment.findById(payload.topic);
            await AuctionComment.findByIdAndUpdate(payload.topic, {
                dislikes: user.dislikes + "~" + payload.message.slice(2),
            });
            client.publish(
                payload.topic,
                "D" + user.dislikes + "~" + payload.message.slice(2)
            );
        } else if (payload.message.slice(0, 2) === "-D") {
            const user = await AuctionComment.findById(payload.topic);
            const preparedLikes = user.dislikes
                .split("~")
                .filter((n) => n !== "")
                .filter((n) => n !== payload.message.slice(2))
                .reduce((acc, curr) => {
                    return acc + "~" + curr;
                }, "");
            await AuctionComment.findByIdAndUpdate(payload.topic, {
                dislikes: preparedLikes,
            });
            client.publish(payload.topic, "D" + preparedLikes);
        } else if (payload.message === "GL") {
            const user = await AuctionComment.findById(payload.topic);
            client.publish(payload.topic, "L" + user.likes);
            client.publish(payload.topic, "D" + user.dislikes);
        }
    } else if ((await chatRooms.map((n) => n.name)).includes(payload.topic)) {
        if (payload.message === "~DELETE") {
            client.publish(payload.topic, "Pokój ten został zamknięty");
            client.unsubscribe(payload.topic);
            const chatRoom = await ChatRoom.find({ name: payload.topic });
            await ChatRoom.deleteOne({ name: payload.topic });
            const user = await User.findById(chatRoom[0].author);
            await User.findByIdAndUpdate(chatRoom[0].author, {
                chats: user.chats.filter((n) => n !== chatRoom[0]._id),
            });
            sendChatRooms();
            const dateTime = new Date();
            fs.appendFileSync(
                `./logs/chatRooms/${payload.topic}.log`,
                `\n[${dateTime.toLocaleString()}] :: Pokój ten został zamknięty \n \n \n`
            );
            fs.appendFileSync(
                `./logs/logsChatRooms.log`,
                `\n[${dateTime.toLocaleString()}] :: Pokój ${
                    payload.topic
                } został zamknięty`
            );
        } else if (payload.message[0] === "~") {
        } else {
            if (
                payload.message.match(
                    "(?<=Użytkownik)(.*)(?=dołączył do czatu)"
                )
            ) {
                const messages = await ChatRoom.find({ name: payload.topic });
                const preparedMessages = messages[0].messages.reduce(
                    (acc, curr) => {
                        return acc + curr + "~";
                    },
                    ""
                );
                client.publish("~" + payload.topic, preparedMessages);
            }
            const oldChatRoom = await ChatRoom.find({ name: payload.topic });
            await ChatRoom.findByIdAndUpdate(oldChatRoom[0]._id, {
                messages: [...oldChatRoom[0].messages, payload.message],
            });
            const dateTime = new Date();
            fs.appendFileSync(
                `./logs/chatRooms/${payload.topic}.log`,
                `\n[${dateTime.toLocaleString()}] :: ${payload.message}`
            );
        }
    }
});

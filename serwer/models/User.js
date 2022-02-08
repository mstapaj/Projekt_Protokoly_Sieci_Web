const {Schema, model} = require("mongoose");

const userSchema = new Schema({
    login: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30,
    },
    password: {type: String, required: true},
    auctions: [{type: Schema.Types.ObjectId, ref: "Auction"}],
    writtenAuctionComments: [
        {type: Schema.Types.ObjectId, ref: "AuctionComments"},
    ],
    writtenUserComments: [{type: Schema.Types.ObjectId, ref: "UserComments"}],
    comments: [{type: Schema.Types.ObjectId, ref: "UserComments"}],
    chats: [{type: Schema.Types.ObjectId, ref: "ChatRoom"}],
    likes: {type: String},
    dislikes: {type: String},
});

module.exports = model("User", userSchema);

const {Schema, model} = require("mongoose");

const auctionCommentSchema = new Schema({
    comment: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 200,
    },
    type: {type: Boolean, required: true},
    author: {type: Schema.Types.ObjectId, ref: "User"},
    auction: {type: Schema.Types.ObjectId, ref: "Auction"},
    likes: {type: String},
    dislikes: {type: String},
});

module.exports = model("AuctionComment", auctionCommentSchema);

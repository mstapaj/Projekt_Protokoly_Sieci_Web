const {Schema, model} = require("mongoose");

const auctionSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
    },
    description: {type: String, maxlength: 500},
    price: {type: Number, min: 0, required: true},
    amount: {type: Number, min: 1, required: true},
    user: {type: Schema.Types.ObjectId, ref: "User"},
    comments: [{type: Schema.Types.ObjectId, ref: "AuctionComment"}],
    watchers: {type: String},
    views: {type: Number, default: 0},
});

module.exports = model("Auction", auctionSchema);

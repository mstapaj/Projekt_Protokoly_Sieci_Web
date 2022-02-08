const {Schema, model} = require("mongoose");

const chatRoomSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30,
    },
    messages: [
        {
            type: String,
            required: true,
            minlength: 1,
            maxlength: 500,
        },
    ],
    author: {type: Schema.Types.ObjectId, ref: "User"},
});

module.exports = model("ChatRoom", chatRoomSchema);

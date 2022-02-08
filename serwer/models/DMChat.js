const {Schema, model} = require("mongoose");

const dmChatSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    messages: [
        {
            type: String,
            required: true,
            minlength: 1,
            maxlength: 500,
        },
    ],
});

module.exports = model("DMChat", dmChatSchema);

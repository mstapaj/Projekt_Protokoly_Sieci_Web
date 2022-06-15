const {Schema, model} = require("mongoose");

const userCommentSchema = new Schema({
    comment: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 200,
    },
    type: {type: Boolean, required: true},
    author: {type: Schema.Types.ObjectId, ref: "User"},
    user: {type: Schema.Types.ObjectId, ref: "User"},
    likes: {type: String},
    dislikes: {type: String},
});

module.exports = model("UserComments", userCommentSchema);

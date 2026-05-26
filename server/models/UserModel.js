const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            default: "",
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        status: {
            type: Boolean,
            default: true,
        },

    },

    {
        timestamps: true
    }
);

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
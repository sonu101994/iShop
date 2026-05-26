const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },

        product_id: {
            type: mongoose.Schema.ObjectId,
            ref: "Product",
            required: true,
        },

        color_id: {
            type: mongoose.Schema.ObjectId,
            ref: "Color",
            default: null,
        },

        qty: {
            type: Number,
            default: 1,
        },
    },
    {
        timestamps: true,
    }
);


const CartModel = mongoose.model("Cart", CartSchema);

module.exports = CartModel;

const mongoose = require("mongoose");


// payment session checkout
const PaymentSessionSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        products: [
            {
                product_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                qty: {
                    type: Number,
                    default: 1,
                },
                color_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Color",
                    default: null,
                },
            },
        ],
        address_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
            default: null,
        },
        shipping_address: {
            type: Object,
            default: null,
        },
        amount: {
            type: Number,
            default: 0,
        },
        razorpay_order_id: {
            type: String,
            default: "",
            index: true,
        },
        status: {
            type: String,
            enum: ["created", "paid", "cancelled"],
            default: "created",
        },
        order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null,
        },
    },
    { timestamps: true }
);

const PaymentSessionModel = mongoose.model("PaymentSession", PaymentSessionSchema);

module.exports = PaymentSessionModel;

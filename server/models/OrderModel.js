const mongoose = require("mongoose");
// shipping address
const ShippingAddressSchema = new mongoose.Schema(
    {
        name: String,
        mobile: String,
        pincode: String,
        address: String,
        locality: String,
        city: String,
        state: String,
        landmark: String,
        address_type: String,
    },
    { _id: false }
);

const OrderSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        address_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
            default: null,
        },

        shipping_address: {
            type: ShippingAddressSchema,
            default: null,
        },

        products: [
            {
                product_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                },

                name: String,
                sku_id: String,
                qty: {
                    type: Number,
                    default: 1,
                },

                original_price: Number,
                discounted_price: Number,
                discount_percentage: Number,

                final_price: Number,

                color_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Color",
                    default: null,
                },
                color_name: String,
                color_code: String,

                image: String,
            },
        ],

        subtotal: {
            type: Number,
            default: 0,
        },
        discount_total: {
            type: Number,
            default: 0,
        },
        total_amount: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            default: "Pending",
        },

        payment_method: {
            type: String,
            default: "COD",
        },

        payment_status: {
            type: String,
            default: "Pending",
        },

        razorpay_order_id: String,
        razorpay_payment_id: String,
        razorpay_signature: String,
    },
    { timestamps: true }
);

const OrderModel = mongoose.model("Order", OrderSchema);

module.exports = OrderModel;

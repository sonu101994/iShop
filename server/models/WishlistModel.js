const mongoose = require("mongoose");

// wishlist 
const WishlistSchema = new mongoose.Schema(
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
    },
    { timestamps: true }
);

WishlistSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

const WishlistModel = mongoose.model("Wishlist", WishlistSchema);
module.exports = WishlistModel;

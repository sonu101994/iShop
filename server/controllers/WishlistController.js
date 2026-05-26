const mongoose = require("mongoose");
const WishlistModel = require("../models/WishlistModel");
const ProductModel = require("../models/ProductModel");
const { message } = require("../library/helper");

const buildWishlistPayload = async (user_id) => {
    const wishlist = await WishlistModel.find({ user_id })
        .populate({
            path: "product_id",
            populate: [
                { path: "brand_id", select: "name slug" },
                { path: "color_ids", select: "name color_code" },
            ],
        })
        .sort({ createdAt: -1 });

    return {
        flag: 1,
        wishlist: wishlist.filter((item) => item.product_id).map((item) => ({
            _id: item._id,
            wishlist_id: item._id,
            product_id: item.product_id._id,
            product: item.product_id,
            image_path: "/images/products/main_images/",
        })),
        image_path: "/images/products/main_images/",
    };
};

const addToWishlist = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { product_id } = req.body;

        if (!product_id) return res.send(message.general_error("product id is required"));

        const product = await ProductModel.findById(product_id);
        if (!product) return res.send(message.general_error("product not found"));

        await WishlistModel.findOneAndUpdate(
            { user_id, product_id },
            { user_id, product_id },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const payload = await buildWishlistPayload(user_id);
        res.send({ ...payload, msg: "added to wishlist" });
    } catch (error) {
        console.log(error);
        if (error.code === 11000) {
            const payload = await buildWishlistPayload(req.user._id);
            return res.send({ ...payload, msg: "already in wishlist" });
        }
        res.send(message.catch_error);
    }
};

const getWishlist = async (req, res) => {
    try {
        const payload = await buildWishlistPayload(req.user._id);
        res.send(payload);
    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};

const deleteWishlistItem = async (req, res) => {
    try {
        const { wishlist_id } = req.params;
        const user_id = req.user._id;
        const filters = [];

        if (mongoose.Types.ObjectId.isValid(String(wishlist_id))) {
            filters.push({ _id: wishlist_id }, { product_id: wishlist_id });
        }

        await WishlistModel.findOneAndDelete(filters.length ? { user_id, $or: filters } : { user_id, _id: null });
        const payload = await buildWishlistPayload(user_id);
        res.send({ ...payload, msg: "wishlist item removed" });
    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};

module.exports = { addToWishlist, getWishlist, deleteWishlistItem, buildWishlistPayload };

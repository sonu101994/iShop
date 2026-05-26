const express = require("express");
const WishlistRouter = express.Router();
const AuthUser = require("../middleware/AuthUser");
const { addToWishlist, getWishlist, deleteWishlistItem } = require("../controllers/WishlistController");

WishlistRouter.get("/", AuthUser, getWishlist);
WishlistRouter.post("/add", AuthUser, addToWishlist);
WishlistRouter.delete("/delete/:wishlist_id", AuthUser, deleteWishlistItem);

module.exports = WishlistRouter;

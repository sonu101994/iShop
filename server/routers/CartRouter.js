const express = require("express");
const CartRouter = express.Router();

const {
    addToCart,
    getCart,
    updateCartQty,
    deleteCartItem,
    clearCart,
} = require("../controllers/CartController");
const AuthUser = require("../middleware/AuthUser");

// get cart
CartRouter.get("/", AuthUser, getCart);

// add to cart
CartRouter.post("/add", AuthUser, addToCart);

// clear cart
CartRouter.delete("/clear", AuthUser, clearCart);

// update cart
CartRouter.patch("/update/:cart_id", AuthUser, updateCartQty);
CartRouter.put("/update/:cart_id", AuthUser, updateCartQty);

// delete item
CartRouter.delete("/delete/:cart_id", AuthUser, deleteCartItem);

module.exports = CartRouter;

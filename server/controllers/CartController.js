const mongoose = require("mongoose");
const CartModel = require("../models/CartModel");
const ProductModel = require("../models/ProductModel");
const { message } = require("../library/helper");


// id valid or not
const toObjectIdFilter = (field, value) => {
    if (!value || !mongoose.Types.ObjectId.isValid(String(value))) return null;
    return { [field]: value };
};

// color id in diffrent format
const normalizeColorId = (value) => {
    const raw = value?._id || value?.color_id || value;
    return raw && mongoose.Types.ObjectId.isValid(String(raw)) ? String(raw) : null;
};

// if selected or default setting
const getSelectedColorFromProduct = (product, requestedColorId) => {
    const colors = product?.color_ids || [];
    if (!colors.length) return null;

    const requested = normalizeColorId(requestedColorId);
    if (requested) {
        const exists = colors.find((color) => String(color?._id || color) === String(requested));
        if (exists) return requested;
    }

    return String(colors[0]?._id || colors[0]);
};
// filter array
const buildCartLookupFilter = (user_id, idOrProductId) => {
    const filters = [];
    const asCartId = toObjectIdFilter("_id", idOrProductId);
    const asProductId = toObjectIdFilter("product_id", idOrProductId);

    if (asCartId) filters.push(asCartId);
    if (asProductId) filters.push(asProductId);

    if (!filters.length) return { user_id, _id: null };
    return { user_id, $or: filters };
};
// building response
const buildCartPayload = async (user_id) => {
    const cart = await CartModel.find({ user_id })
        .populate({
            path: "product_id",
            populate: [
                {
                    path: "brand_id",
                    select: "name slug category_ids",
                    populate: {
                        path: "category_ids",
                        select: "name slug",
                    },
                },
                {
                    path: "color_ids",
                    select: "name color_code",
                },
            ],
        })
        .populate("color_id", "name color_code")
        .sort({ updatedAt: -1 });

    let grand_total = 0;

    const finalCart = cart
        .filter((item) => item.product_id)
        .map((item) => {
            const product = item.product_id;
            const selectedColor = item.color_id
                ? {
                      _id: item.color_id._id,
                      color_id: item.color_id._id,
                      name: item.color_id.name,
                      color_code: item.color_id.color_code,
                  }
                : null;
            const unitPrice = Number(product.discounted_price || product.price || 0);
            const qty = Math.max(1, Number(item.qty || 1));
            const subtotal = unitPrice * qty;
            grand_total += subtotal;

            return {
                _id: item._id,
                cart_id: item._id,
                product_id: product._id,
                color_id: selectedColor?._id || null,
                selected_color: selectedColor,
                qty,
                quantity: qty,
                unit_price: unitPrice,
                subtotal,
                product,
                image_path: "/images/products/main_images/",
            };
        });

    return {
        flag: 1,
        cart: finalCart,
        grand_total,
        cart_count: finalCart.length,
        total_qty: finalCart.reduce((total, item) => total + Number(item.qty || 0), 0),
        image_path: "/images/products/main_images/",
    };
};

// add to cart function
const addToCart = async (req, res) => {
    try {
        const data = req.body;
        const user_id = req.user._id;
        const qty = Math.max(1, Number(data.qty || data.quantity || 1));

        if (!data.product_id) {
            return res.send(message.general_error("product id is required"));
        }

        const product = await ProductModel.findById(data.product_id).populate("color_ids", "name color_code");

        if (!product) {
            return res.send(message.general_error("product not found"));
        }

        const requestedColor = data.color_id || data.selected_color_id || data.selected_color;
        const color_id = getSelectedColorFromProduct(product, requestedColor);

        const exists = await CartModel.findOne({
            user_id,
            product_id: data.product_id,
            color_id: color_id || null,
        });

        if (exists) {
            exists.qty = Math.max(1, Number(exists.qty || 1) + qty);
            await exists.save();

            const payload = await buildCartPayload(user_id);
            return res.send({
                ...payload,
                msg: "cart updated",
            });
        }

        await CartModel.create({
            user_id,
            product_id: data.product_id,
            color_id: color_id || null,
            qty,
        });

        const payload = await buildCartPayload(user_id);
        res.send({
            ...payload,
            msg: "added to cart",
        });
    } catch (error) {
        console.log(error);
        if (error.code === 11000) {
            const payload = await buildCartPayload(req.user._id);
            return res.send({ ...payload, msg: "cart updated" });
        }
        res.send(message.catch_error);
    }
};

// get cart items details
const getCart = async (req, res) => {
    try {
        const user_id = req.user._id;
        const payload = await buildCartPayload(user_id);
        res.send(payload);
    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};

// update quantity. :cart_id also accepts product_id as fallback.
const updateCartQty = async (req, res) => {
    try {
        const { cart_id } = req.params;
        const { qty } = req.body;
        const user_id = req.user._id;

        const nextQty = Math.max(1, Number(qty || 1));
        const cart = await CartModel.findOne(buildCartLookupFilter(user_id, cart_id));

        if (!cart) {
            return res.send(message.general_error("cart not found"));
        }

        cart.qty = nextQty;
        await cart.save();

        const payload = await buildCartPayload(user_id);
        res.send({
            ...payload,
            msg: "cart updated",
        });
    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};

// delete cart item. :cart_id also accepts product_id as fallback.
const deleteCartItem = async (req, res) => {
    try {
        const { cart_id } = req.params;
        const user_id = req.user._id;

        const deleted = await CartModel.findOneAndDelete(buildCartLookupFilter(user_id, cart_id));

        const payload = await buildCartPayload(user_id);
        res.send({
            ...payload,
            msg: deleted ? "cart item removed successfully" : "item already removed",
        });
    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};
// =removing all cart items
const clearCart = async (req, res) => {
    try {
        await CartModel.deleteMany({ user_id: req.user._id });
        res.send({
            flag: 1,
            msg: "cart cleared successfully",
            cart: [],
            grand_total: 0,
            cart_count: 0,
            total_qty: 0,
            image_path: "/images/products/main_images/",
        });
    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};

module.exports = { addToCart, getCart, updateCartQty, deleteCartItem, clearCart, buildCartPayload };

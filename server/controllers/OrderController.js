const OrderModel = require("../models/OrderModel");
const CartModel = require("../models/CartModel");
const AddressModel = require("../models/AddressModel");
const { message } = require("../library/helper");
const ProductModel = require("../models/ProductModel");
// address snapshot
const getAddressSnapshot = async (userId, address_id, shipping_address) => {
    if (shipping_address && shipping_address.address) {
        return {
            address_id: address_id || shipping_address._id || null,
            shipping_address: {
                name: shipping_address.name,
                mobile: shipping_address.mobile,
                pincode: shipping_address.pincode,
                address: shipping_address.address,
                locality: shipping_address.locality,
                city: shipping_address.city,
                state: shipping_address.state,
                landmark: shipping_address.landmark || "",
                address_type: shipping_address.address_type || "home",
            },
        };
    }

    if (!address_id) {
        return { address_id: null, shipping_address: null };
    }

    const address = await AddressModel.findOne({ _id: address_id, user_id: userId });
    if (!address) return { address_id: null, shipping_address: null };

    return {
        address_id: address._id,
        shipping_address: {
            name: address.name,
            mobile: address.mobile,
            pincode: address.pincode,
            address: address.address,
            locality: address.locality,
            city: address.city,
            state: address.state,
            landmark: address.landmark || "",
            address_type: address.address_type || "home",
        },
    };
};

const buildOrderProducts = async (products = []) => {
    let subtotal = 0;
    let discount_total = 0;
    const orderProducts = [];

    for (let item of products) {
        if (!item.product_id) continue;

        const product = await ProductModel.findById(item.product_id).populate("color_ids", "name color_code");
        if (!product) continue;

        const qty = Math.max(1, Number(item.qty || item.quantity || 1));
        const originalUnitPrice = Number(product.original_price || product.discounted_price || product.price || 0);
        const discountedUnitPrice = Number(product.discounted_price || product.price || originalUnitPrice);
        const originalPrice = originalUnitPrice * qty;
        const discountedPrice = discountedUnitPrice * qty;

        const requestedColorId = item.color_id?._id || item.color_id || item.selected_color?._id || item.selected_color?.color_id || null;
        const selectedColor = requestedColorId
            ? (product.color_ids || []).find((color) => String(color._id) === String(requestedColorId))
            : null;

        subtotal += originalPrice;
        discount_total += Math.max(0, originalPrice - discountedPrice);

        orderProducts.push({
            product_id: product._id,
            name: product.name,
            sku_id: product.sku_id,
            qty,
            original_price: originalUnitPrice,
            discounted_price: discountedUnitPrice,
            discount_percentage: Number(product.discount_percentage || 0),
            final_price: discountedPrice,
            color_id: selectedColor?._id || null,
            color_name: selectedColor?.name || "",
            color_code: selectedColor?.color_code || "",
            image: product.image_name,
        });
    }

    return {
        orderProducts,
        subtotal,
        discount_total,
        total_amount: subtotal - discount_total,
    };
};

const createOrderRecord = async ({ userId, products, payment_method = "COD", payment_status = "Pending", status = "Pending", address_id, shipping_address, razorpay_order_id }) => {
    const built = await buildOrderProducts(products);

    if (!built.orderProducts.length) {
        return null;
    }

    const addressPayload = await getAddressSnapshot(userId, address_id, shipping_address);

    const order = await OrderModel.create({
        user_id: userId,
        products: built.orderProducts,
        subtotal: built.subtotal,
        discount_total: built.discount_total,
        total_amount: built.total_amount,
        payment_method,
        payment_status,
        status,
        razorpay_order_id,
        ...addressPayload,
    });

    for (const item of built.orderProducts) {
        await ProductModel.findByIdAndUpdate(item.product_id, {
            $inc: { total_sales: item.qty },
        });
    }

    return order;
};

// create order function (user)
const createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { products, payment_method, address_id, shipping_address } = req.body;

        if (!products || products.length === 0) {
            return res.send(message.general_error("cart is empty"));
        }

        const order = await createOrderRecord({
            userId,
            products,
            payment_method: payment_method || "COD",
            payment_status: payment_method === "ONLINE" ? "Pending" : "Pending",
            status: "Pending",
            address_id,
            shipping_address,
        });

        if (!order) {
            return res.send(message.general_error("valid products not found"));
        }

        await CartModel.deleteMany({ user_id: userId });

        return res.send({
            flag: 1,
            msg: "Order placed successfully",
            order,
        });
    } catch (error) {
        console.log(error);
        return res.send(message.catch_error);
    }
};

// get user orders
const getMyOrders = async (req, res) => {
    try {
        const orders = await OrderModel.find({
            user_id: req.user._id,
            $nor: [{ payment_method: "ONLINE", payment_status: "Pending" }],
        }).sort({ createdAt: -1 });
        return res.send({
            flag: 1,
            orders,
        });
    } catch (error) {
        return res.send(message.catch_error);
    }
};

// get single order
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const filter = { _id: id };

        if (req.user && !req.user.role) {
            filter.user_id = req.user._id;
        }

        const order = await OrderModel.findOne(filter).populate("user_id", "name email");

        if (!order) {
            return res.send(message.general_error("order not found"));
        }

        return res.send({
            flag: 1,
            order,
        });
    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};

// admin-get all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await OrderModel.find().populate("user_id", "name email").sort({ createdAt: -1 });

        return res.send({
            flag: 1,
            orders,
        });
    } catch (error) {
        console.log(error);
        return res.send(message.catch_error);
    }
};

// admin- order update status
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        const order = await OrderModel.findById(id);

        if (!order) {
            return res.send(message.general_error("order not found"));
        }

        order.status = status;
        await order.save();

        return res.send({
            flag: 1,
            msg: "order status updated",
            order,
        });
    } catch (error) {
        console.log(error);
        return res.send(message.catch_error);
    }
};

// user- cancel order
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await OrderModel.findOne({ _id: id, user_id: req.user._id });
        if (!order) {
            return res.send(message.general_error("order not found"));
        }

        if (String(order.status || "").toLowerCase() !== "pending") {
            return res.send({
                flag: 0,
                msg: "Only pending orders can be cancelled",
            });
        }

        order.status = "Cancelled";
        if (order.payment_method === "ONLINE" && order.payment_status === "Pending") {
            order.payment_status = "Cancelled";
        }
        await order.save();
        res.send({
            flag: 1,
            msg: "order cancelled",
            order,
        });
    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    createOrderRecord,
    buildOrderProducts,
};

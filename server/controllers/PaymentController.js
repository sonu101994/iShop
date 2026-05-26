const crypto = require("crypto");
const CartModel = require("../models/CartModel");
const PaymentSessionModel = require("../models/PaymentSessionModel");
const { message } = require("../library/helper");
const razorpay = require("../config/razorpay");
const { createOrderRecord, buildOrderProducts } = require("./OrderController");

// getting products from cart 
const getProductsFromCart = async (user_id) => {
    const cart = await CartModel.find({ user_id });
    return cart.map((item) => ({
        product_id: item.product_id,
        qty: item.qty,
        color_id: item.color_id || null,
    }));
};

// create Razorpay payment session only. The real order is created after payment verification.
const createPaymentOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const bodyProducts = Array.isArray(req.body.products) ? req.body.products : [];
        const products = bodyProducts.length ? bodyProducts : await getProductsFromCart(userId);

        if (!products.length) {
            return res.send(message.general_error("cart empty"));
        }

        if (!process.env.RAZORPAY_KEY_ID || !(process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET)) {
            return res.send(message.general_error("online payment is not configured"));
        }

        const built = await buildOrderProducts(products);
        if (!built.orderProducts.length || Number(built.total_amount || 0) <= 0) {
            return res.send(message.general_error("valid products not found"));
        }

        const paymentSession = await PaymentSessionModel.create({
            user_id: userId,
            products: products.map((item) => ({
                product_id: item.product_id,
                qty: Math.max(1, Number(item.qty || item.quantity || 1)),
                color_id: item.color_id?._id || item.color_id || item.selected_color?._id || item.selected_color?.color_id || null,
            })),
            address_id: req.body.address_id || null,
            shipping_address: req.body.shipping_address || null,
            amount: built.total_amount,
            status: "created",
        });

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(Number(built.total_amount || 0) * 100),
            currency: "INR",
            receipt: `receipt_${String(paymentSession._id).slice(-24)}`,
            notes: {
                payment_session_id: String(paymentSession._id),
                user_id: String(userId),
            },
        });

        paymentSession.razorpay_order_id = razorpayOrder.id;
        await paymentSession.save();

        res.send({
            flag: 1,
            razorpay_order_id: razorpayOrder.id,
            payment_session_id: paymentSession._id,
            amount: built.total_amount,
            razorpay_key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};

// verify payment and create final order only after successful payment.
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_session_id } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.send(message.general_error("payment details missing"));
        }

        const generatedSignature = crypto
            .createHmac("sha256", (process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET))
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.send(message.general_error("payment verification failed"));
        }

        const sessionFilter = {
            user_id: req.user._id,
            razorpay_order_id,
            status: "created",
        };

        if (payment_session_id) sessionFilter._id = payment_session_id;

        const paymentSession = await PaymentSessionModel.findOne(sessionFilter);

        if (!paymentSession) {
            return res.send(message.general_error("payment session not found or already processed"));
        }

        const order = await createOrderRecord({
            userId: req.user._id,
            products: paymentSession.products,
            payment_method: "ONLINE",
            payment_status: "Paid",
            status: "Confirmed",
            address_id: paymentSession.address_id,
            shipping_address: paymentSession.shipping_address,
            razorpay_order_id,
        });

        if (!order) {
            return res.send(message.general_error("valid products not found"));
        }

        order.razorpay_payment_id = razorpay_payment_id;
        order.razorpay_signature = razorpay_signature;
        await order.save();

        paymentSession.status = "paid";
        paymentSession.order_id = order._id;
        await paymentSession.save();

        await CartModel.deleteMany({ user_id: req.user._id });

        res.send({
            flag: 1,
            msg: "payment successful",
            order,
        });
    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};
// cancel payment
const cancelPayment = async (req, res) => {
    try {
        const { razorpay_order_id, payment_session_id } = req.body;
        const filter = {
            user_id: req.user._id,
            status: "created",
        };

        if (payment_session_id) filter._id = payment_session_id;
        if (razorpay_order_id) filter.razorpay_order_id = razorpay_order_id;

        if (!payment_session_id && !razorpay_order_id) {
            return res.send(message.general_error("payment session id required"));
        }

        const paymentSession = await PaymentSessionModel.findOne(filter);
        if (paymentSession) {
            paymentSession.status = "cancelled";
            await paymentSession.save();
        }

        res.send({
            flag: 1,
            msg: "payment cancelled",
        });
    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};

module.exports = { createPaymentOrder, verifyPayment, cancelPayment };

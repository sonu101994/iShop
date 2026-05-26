const express = require("express");
const PaymentRouter = express.Router();
const { createPaymentOrder, verifyPayment, cancelPayment } = require("../controllers/PaymentController");
const AuthUser = require("../middleware/AuthUser");

// create Razorpay payment session
PaymentRouter.post("/create-order", AuthUser, createPaymentOrder);

// verify successful Razorpay payment
PaymentRouter.post("/verify", AuthUser, verifyPayment);

// mark cancelled Razorpay checkout session without creating an order
PaymentRouter.post("/cancel", AuthUser, cancelPayment);

module.exports = PaymentRouter;

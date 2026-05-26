const OrderModel = require("../models/OrderModel");
const ProductModel = require("../models/ProductModel");
const UserModel = require("../models/UserModel");


// dashboard 
const getDashBoard = async (req, res) => {
    try {
        const [
            totalOrders,
            pendingOrders,
            receivedOrders,
            processingOrders,
            deliveredOrders,
            totalProducts,
            totalCustomers,
        ] = await Promise.all([
            OrderModel.countDocuments(),
            OrderModel.countDocuments({ status: "Pending" }),
            OrderModel.countDocuments({ status: { $in: ["Received", "Confirmed"] } }),
            OrderModel.countDocuments({ status: "Processing" }),
            OrderModel.countDocuments({ status: "Delivered" }),
            ProductModel.countDocuments(),
            UserModel.countDocuments(),
        ]);

        // Revenue should not include cancelled orders or unpaid online payment records.
        const revenueData = await OrderModel.aggregate([
            {
                $match: {
                    status: { $ne: "Cancelled" },
                    $nor: [{ payment_method: "ONLINE", payment_status: "Pending" }],
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$total_amount" },
                },
            },
        ]);

        const recentOrders = await OrderModel.find()
            .populate("user_id", "name email")
            .sort({ createdAt: -1 })
            .limit(5)
            .select("products total_amount status payment_method payment_status createdAt user_id");

        return res.send({
            flag: 1,
            data: {
                stats: {
                    totalRevenue: revenueData[0]?.total || 0,
                    totalOrders,
                    totalProducts,
                    totalCustomers,
                    pendingOrders,
                    receivedOrders,
                    processingOrders,
                    deliveredOrders,
                },
                recentOrders,
            },
        });
    } catch (error) {
        console.log("dashboard error", error);
        return res.send({ flag: 0, msg: "Dashboard error" });
    }
};

module.exports = { getDashBoard };

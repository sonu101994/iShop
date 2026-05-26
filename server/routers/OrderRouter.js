
const express=require("express");
const OrderRouter=express.Router();
const AuthUser=require("../middleware/AuthUser");
const AuthAdmin=require("../middleware/AuthAdmin");

const {createOrder,getMyOrders,getOrderById,getAllOrders,updateOrderStatus,cancelOrder}=require("../controllers/OrderController");

// user routes with middleware

OrderRouter.post("/create",AuthUser,createOrder);
OrderRouter.get("/my-orders",AuthUser,getMyOrders);//fet logged in user orders
OrderRouter.get("/details/:id",AuthUser,getOrderById);//single  order detail
OrderRouter.patch("/cancel/:id",AuthUser,cancelOrder);//cancel order

// admin routes with middleware
OrderRouter.get("/admin/all",AuthAdmin([0,1,2]),getAllOrders);//all orders
OrderRouter.patch("/admin/status/:id",AuthAdmin([0,1,2]),updateOrderStatus);
OrderRouter.get("/admin/details/:id",AuthAdmin([0,1,2]),getOrderById);


module.exports=OrderRouter;


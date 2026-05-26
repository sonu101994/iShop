const express = require("express");

const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");
const app=express();

const AdminRouter=require("./routers/AdminRouter");
const CategoryRouter=require("./routers/CategoryRouter");
const BrandRouter=require("./routers/BrandRouter");
const ColorRouter=require("./routers/ColorRouter");
const ProductRouter=require("./routers/ProductRouter");
const UserRouter=require("./routers/UserRouter");
const UserManagementRouter=require("./routers/UserManagementRouter");
const OrderRouter=require("./routers/OrderRouter");
const DashBoardRouter = require("./routers/DashBoardRouter");
const CartRouter = require("./routers/CartRouter");
const AddressRouter = require("./routers/AddressRouter");
const PaymentRouter = require("./routers/PaymentRouter");
const WishlistRouter = require("./routers/WishlistRouter");


app.use(express.json({ limit: "10mb" })); //parser
app.use(express.urlencoded({ extended: true }));
app.use(
    fileUpload({
        createParentPath: true,
    })
);


// app.use(express.static("public"));
app.use(express.static(path.join(__dirname,"public")));
app.use(cors(
    {
       origin:process.env.CLIENT_URL,
        credentials: true
    }
));

// testing api
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "API running successfully",
    });
});



app.use("/api/admin",AdminRouter)
app.use("/api/category",CategoryRouter);
app.use("/api/brand",BrandRouter);
app.use("/api/color",ColorRouter);
app.use("/api/product",ProductRouter);
app.use("/api/user",UserRouter);
app.use("/api/admin/users",UserManagementRouter);
app.use("/api/order",OrderRouter);
app.use("/api/dashboard",DashBoardRouter);
app.use("/api/cart",CartRouter);
app.use("/api/address",AddressRouter);
app.use("/api/payment",PaymentRouter);
app.use("/api/wishlist",WishlistRouter);


module.exports = app;
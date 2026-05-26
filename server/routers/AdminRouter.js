const express=require("express");
const AuthAdmin=require("../middleware/AuthAdmin");

const AdminRouter=express.Router();

const {register,login,getAllAdmins,updateAdmin,updateAdminStatus,getAdminById,getAdminProfile,changePassword}=require("../controllers/AdminController");

// auth
AdminRouter.post("/register",AuthAdmin([0]),register);
AdminRouter.post("/login",login);

// admin management
AdminRouter.get("/all",AuthAdmin([0,1,2]),getAllAdmins);
AdminRouter.patch("/status/:id",AuthAdmin([0]),updateAdminStatus);
AdminRouter.get("/single/:id",AuthAdmin([0,1,2]),getAdminById);

AdminRouter.put("/update/:id", AuthAdmin([0]), updateAdmin);

AdminRouter.put("/change-password", AuthAdmin([0,1,2]), changePassword);

// profile
AdminRouter.get("/profile",AuthAdmin([0,1,2]),getAdminProfile);






module.exports=AdminRouter;
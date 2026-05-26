const express=require("express");
const UserManagementRouter=express.Router();

const {getUsers,deleteUser,toggleUser}=require("../controllers/UserManagementController");

const AuthAdmin=require("../middleware/AuthAdmin");

UserManagementRouter.get("/",AuthAdmin([0,1,2]),getUsers);
UserManagementRouter.delete("/:id",AuthAdmin([0]),deleteUser);
UserManagementRouter.patch("/toggle/:id",AuthAdmin([0,1,2]),toggleUser);

module.exports=UserManagementRouter;


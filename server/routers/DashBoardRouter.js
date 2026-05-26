const express=require("express");
const DashBoardRouter=express.Router();
const AuthAdmin=require("../middleware/AuthAdmin");
const {getDashBoard}=require("../controllers/DashBoardController");

DashBoardRouter.get("/",AuthAdmin([0,1,2]),getDashBoard);
module.exports=DashBoardRouter;
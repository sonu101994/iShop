const express=require("express");
const ColorRouter=express.Router();
const AuthAdmin=require("../middleware/AuthAdmin");

const {getColor,createColor,toggleColor,updateColor,deleteColor,deleteAll}=require("../controllers/ColorController");


ColorRouter.get("/",getColor);
ColorRouter.post("/create",AuthAdmin([0,1]),createColor);
ColorRouter.patch("/toggle/:id",toggleColor);
ColorRouter.delete("/delete/:id",AuthAdmin([0]),deleteColor);
ColorRouter.put("update/:id",AuthAdmin([0,1]),updateColor);

module.exports=ColorRouter;
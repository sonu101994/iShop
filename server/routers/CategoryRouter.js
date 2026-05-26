const express=require("express");
const CategoryRouter=express.Router();
const {getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategory,
        }=require("../controllers/CategoryController");
const AuthAdmin=require("../middleware/AuthAdmin");



CategoryRouter.get("/",getCategories);

CategoryRouter.post("/create",AuthAdmin([0,1]),createCategory);

CategoryRouter.delete("/delete/:id",AuthAdmin([0]),deleteCategory);

CategoryRouter.patch("/toggle/:id/:flag",AuthAdmin([0,1]),toggleCategory);

CategoryRouter.put("/edit/:id",AuthAdmin([0,1]),updateCategory);




module.exports=CategoryRouter;
const express = require("express");
const BrandRouter = express.Router();
const AuthAdmin=require("../middleware/AuthAdmin");
const { getBrands,
     createBrand,
      toggleBrand,
       updateBrand,
        deleteBrand,
         } = require("../controllers/BrandController");


BrandRouter.get("/", getBrands);
BrandRouter.post("/create",  AuthAdmin([0, 1]),createBrand);

BrandRouter.delete("/delete/:id",  AuthAdmin([0]),deleteBrand);
BrandRouter.patch("/toggle/:id",  AuthAdmin([0, 1]),toggleBrand);
BrandRouter.put("/edit/:id",  AuthAdmin([0, 1]),updateBrand);



module.exports = BrandRouter;
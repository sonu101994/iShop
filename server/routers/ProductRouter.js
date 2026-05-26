const express = require("express");
const ProductRouter = express.Router();
const { getProducts,
  createProduct,
  addOtherImages,
  toggleProduct,
  deleteProduct,
  deleteOtherImages,
  updateProduct
} = require("../controllers/ProductController");

const  AuthAdmin  = require("../middleware/AuthAdmin");

ProductRouter.get("/", getProducts);
ProductRouter.post("/create", AuthAdmin([0, 1, 2]), createProduct);
ProductRouter.patch("/toggle/:id/:flag", AuthAdmin([0, 1]), toggleProduct);
ProductRouter.delete("/delete/:id", AuthAdmin([0]), deleteProduct);
ProductRouter.post("/add-other-images/:product_id", AuthAdmin([0, 1, 2]), addOtherImages);
ProductRouter.delete("/delete-other-image/:product_id/:idx", AuthAdmin([0, 1, 2]), deleteOtherImages)
ProductRouter.put("/edit/:id", AuthAdmin([0, 1, 2]), updateProduct)


module.exports = ProductRouter;
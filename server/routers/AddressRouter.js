const express=require("express");
const AddressRouter=express.Router();

const AuthUser=require("../middleware/AuthUser");
const {addAddress,getAddresses,updateAddress,deleteAddress}=require("../controllers/AddressController");

// get all addresses
AddressRouter.get("/",AuthUser,getAddresses);

// add address
AddressRouter.post("/add",AuthUser,addAddress);

// update address
AddressRouter.patch(
    "/update/:address_id",AuthUser,updateAddress
);

// delete address
AddressRouter.delete("/delete/:address_id",AuthUser,deleteAddress);

module.exports=AddressRouter;

const mongoose=require("mongoose");

const AddressSchema=new mongoose.Schema(
    {
        user_id:{
            type:mongoose.Schema.ObjectId,
            ref:"User",
            required:true,
        },
        name:{
            type:String,
            required:true,
        },
        mobile:{
            type:String,
            required:true,
        },
        pincode:{
            type:String,
            required:true,
        },

        address:{
            type:String,
            required:true,
        },
        locality:{
            type:String,
            required:true,
        },
        city:{
            type:String,
            required:true,
        },
        state:{
            type:String,
            required:true,
        },
        landmark:{
            type:String,
            default:"",
        },

        address_type:{
            type:String,
            enum:["home","office"],
            default:"home",
        },
        is_default:{
            type:Boolean,
            default:false,
        },
    },

    {
        timestamps:true,
    }
);

const AddressModel=mongoose.model("Address",AddressSchema);
module.exports=AddressModel;
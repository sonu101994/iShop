const mongoose =require("mongoose");
const ColorSchema=new mongoose.Schema({
    name:{
        type:String,
        unique:true,
    },
    slug:{
        type:String,
        unique:true,
    },

    color_code:{
        type:String,
        unique:true,
    },

    status:{
        type:Boolean,
        default:true,
    }
},
    {
        timestamps:true,
    },
);

const ColorModel=mongoose.model("Color",ColorSchema);
module.exports=ColorModel;
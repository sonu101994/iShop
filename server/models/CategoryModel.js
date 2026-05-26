const mongoose=require("mongoose");

const categorySchema=new mongoose.Schema({
    name:{
        type:String,
        require:true,
        Trim:true
    },
    slug:{
        type:String,
        require:true,
        trim:true,
        unique:true
    },

    image_name:{
        type:String,
        unique:true,
    },
    status:{
        type:Boolean,
        default:true
    },
    on_home:{
        type:Boolean,
        default:false
    },
    is_featured:{
        type:Boolean,
        default:false,
    },
    is_top:{
        type:Boolean,
        default:false,
    }

},
{
    timestamps:true,
}

);

const CategoryModel=mongoose.model("Category",categorySchema);

module.exports=CategoryModel;
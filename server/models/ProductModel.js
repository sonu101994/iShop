const mongoose=require("mongoose");

const ProductSchema=new mongoose.Schema({
   
    sku_id:{
        type:String,
        required:true,
        unique:true,
    },
    name:{
        type:String,
        required:true,
        trim:true,
    },
    slug:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
    },

    original_price:{
        type:Number,
        required:true,
    },
    discounted_price:{
        type:Number,
        required:true,
    },
    discount_percentage:{
        type:Number,
        required:true,
        default:0,
    },
    description:{
        type:String,
        required:true,
    },

    short_description:{
        type:String,
        default:"",
    },
    other_images:[{type:String}],

    color_ids:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"Color",
        },
    ],
    brand_id:{
        type:mongoose.Schema.ObjectId,
        ref:"Brand",
        required:true,
    },

    stock:{
        type:Number,
        default:0,
    },

    total_sales:{
        type:Number,
        default:0,
    },
    rating:{
        type:Number,
        default:0,
    },
    total_reviews:{
        type:Number,
        default:0,
    },

     seo_title: {
      type: String,
      default: "",
    },

    seo_description: {
      type: String,
      default: "",
    },

    image_name:{
        type:String,
        unique:true,
    },
    status:{
        type:Boolean,
        default:true,
    },
    is_hot:{
        type:Boolean,
        default:false,
    },
    on_home:{
        type:Boolean,
        default:false,
    },
    is_featured:{
        type:Boolean,
        default:false,
    },
    is_best:{
        type:Boolean,
        default:false,
    },
    is_top:{
        type:Boolean,
        default:false,
    },

},
 {
    timestamps:true,
 }

);




const ProductModel=mongoose.model("Product",ProductSchema);
module.exports=ProductModel;
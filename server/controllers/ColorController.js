const { message } = require("../library/helper");
const ColorModel=require("../models/ColorModel");


// get all colors
const getColor = async (req, res) => {
    try {
        const { id, slug, status } = req.query;

        const filter = {};
        if (id) {
            filter._id = id;
        }
        if (slug) {
            filter.slug = slug;
        }

        if (typeof status !== "undefined") {
            filter.status = status === "true";
        }

        const colors=await ColorModel.find(filter).sort({createdAt:-1});


        res.send({
            flag:1,
            count:colors.length,
            colors
        });

    } catch (error) {
        console.log(error.message);
        res.send(message.catch_error);
    }
}

// create color
const createColor=async(req,res)=>{
    try {
        const {name,slug,color_code}=req.body;

        if (!name||!slug||!color_code) {
            return res.send(message.general_error("all fields required"));
        }

        const exists=await ColorModel.findOne({
            $or:[{name},{slug},{color_code}],
        });

        if (exists) {
            return res.send(message.general_error("color already exists"));
        }

        const color =new ColorModel({
            name,
            slug,
            color_code,
        });
        await color.save();
        res.send(message.created_msg("color"));
    } catch (error) {
        console.log(error.message);
        res.send(message.catch_error);
    }
};

// delete color
const deleteColor=async (req,res)=>{
    try {
        const {id}=req.params;
        const color =await ColorModel.findById(id);
        if(!color){
            return res.send(message.general_error("color not found"));
        }

        await ColorModel.findByIdAndDelete(id);
        res.send(message.delete_msg("color"));
    } catch (error) {
        
    }
}

// toggle status
const toggleColor=async(req,res)=>{
    try {
        const {id}=req.params;
        const color=await ColorModel.findById(id);

        if (!color) {
            return res.send(message.general_error("color not found"));
        }

        color.status=!color.status;

        await color.save();
        res.send(message.general_success("toggles successfully"));
    } catch (error) {
        console.log(error.message);
        res.send(message.catch_error);
    }
};

// update color

const updateColor=async(req,res)=>{
   try {
     const {id}=req.params;
    const {name,slug,color_code}=req.body;
    const color=await ColorModel.findById(id);

    if (!color) {
        return res.send(message.general_error("color not found"));
    }

    const duplicate=await ColorModel.findOne({
        _id:{$ne:id},
        $or:[{name},{slug},{color_code}],
    });

    if (duplicate) {
        return res.send(message.general_error("color exists already"));
    }

    color.name=name;
    color.slug=slug;
    color.color_code=color_code;
    await color.save();
    res.send(message.general_success("color updated"));
   } catch (error) {
    console.log(error.message);
    res.send(message.catch_error);
   }
};



module.exports={getColor,createColor,deleteColor,toggleColor,updateColor};


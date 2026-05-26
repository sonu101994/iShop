const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        role: {
            type: Number,
            default: 1,
            enum: [0, 1, 2],

            // 0:super admin 1:admin 2:manager
        },
        status:{
            type:Boolean,
            default:true,
        },
    },
    {timestamps:true},
);

const AdminModel=mongoose.model("Admin",adminSchema);

module.exports=AdminModel;
const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
    },
    image_name: {
        type: String,
        unique: true,
    },
    status: {
        type: Boolean,
        default: true,
    },

    category_ids: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Category",
            required: true,
        },
      
    ],
      is_featured: {
            type: Boolean,
            default: false,
        },
},
    {
        timestamps: true,
    },
)

const BrandModel = mongoose.model("Brand", BrandSchema);

module.exports = BrandModel;
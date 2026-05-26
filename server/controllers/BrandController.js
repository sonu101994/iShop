const path = require("path");
const { generateRandomNames,message } = require("../library/helper");
const BrandModel=require("../models/BrandModel");
const fs = require("fs");

// get brands function 
const getBrands = async (req, res) => {
    try {
        const query = req.query;
        const filter = {};
        if (query.id) {
            filter._id = query.id;
        }
        if (query.slug) {
            filter.slug = query.slug;
        }
        if (query.status) {
            filter.status = query.status == "true";
        }

        if (query.category_id) {
            filter["category_ids"] = {
                $in: query.category_id,
            };
        }
        if (
            query.is_featured !==
            undefined
        ) {
            filter.is_featured =
                query.is_featured ==
                "true";
        }


        if (query.search) {

            filter.name = {
                $regex: query.search,
                $options: "i",
            };
        }
        console.log(filter);

        const brands = await BrandModel.find(filter).sort({ createdAt: -1 }).populate({
            path: "category_ids",
            select: "name slug"
        });

        res.send({
            count: Array.isArray(brands) && brands.length,
            flag: 1,
            brands,
            image_path: "/images/brand/",
        })

    } catch (error) {
        res.send(message.catch_error);
        console.log(error.message);
    }
}

// create function [post]

const createBrand = async (req, res) => {
    try {
        const data = req.body;
        const image = req.files?.image;
        const brandExists = await BrandModel.findOne({
            $or: [{ name: data.name }, { slug: data.slug }],
        });

        if (brandExists) {
            return res.send(message.general_error("Name and Slug must be unique"));
        }

        // image upload
        let imageName = "";
        if (image) {
            imageName = generateRandomNames(image.name);
            const destination = path.join(__dirname, "../public/images/brand/", imageName);
            await image.mv(destination);
        }

        const brand = new BrandModel({
            name: data.name,
            slug: data.slug,
            category_ids: JSON.parse(data.category_ids),
            image_name: imageName
        });

        await brand.save();
        res.send(message.created_msg("Brand"));
    } catch (error) {
        console.log(error.message);
        res.send(message.catch_error);
    }
}


// delete brand function
const deleteBrand = async (req, res) => {
    try {
        const {id} = req.params;
        const brand = await BrandModel.findById(id);

        if (!brand) {
            return res.send(
                message.general_error("Brand not found")
            );
        }
        // delete image
        if (brand.image_name) {
            const imagePath = path.join(
            __dirname,
            "../public/images/brands/",
            brand.image_name);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await BrandModel.findByIdAndDelete(id);
        res.send(message.delete_msg("Brand"));
    } catch (error) {
        res.send(message.catch_error);
    }
};

// toggle brand status
const toggleBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const brand = await BrandModel.findById(id);
        if (!brand) {
            return res.send(
                message.general_error("Brand not found")
            );
        }

        brand.status = !brand.status;


        await brand.save();
        res.send(
            message.general_success("Status toggled successfully")
        );
    } catch (error) {
        res.send(message.catch_error);
    }
}
// update data function to update existing values

const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const image = req.files?.image;

        const brand = await BrandModel.findById(id);

        if (!brand) {
            return res.send(
                message.general_error("brand not found")
            );
        }

        const duplicateBrand = await BrandModel.findOne({
            _id: { $ne: id },
            $or: [
                { name: data.name },
                { slug: data.slug },
            ],
        });

        if (duplicateBrand) {
            return res.send(
                message.general_error(
                    "brand already exists"
                )
            )
        }
        if (image) {

            const imageName = generateRandomNames(image.name);

            const destination = "./public/images/brand/" + imageName;

            await image.mv(destination);

            // delete old image
            if (brand.image_name) {

                const oldPath = path.join(
                    __dirname,
                    "../public/images/brands/",
                    brand.image_name
                );

                if (fs.existsSync(oldImagePath)) {

                    fs.unlinkSync(oldImagePath);

                }

            }

            brand.image_name = imageName;

        }

        brand.name = data.name;
        brand.slug = data.slug;
        if (data.category_ids) {
            brand.category_ids = JSON.parse(data.category_ids);
        }
        await brand.save();
        res.send(message.general_success("Brand updated"));
    } catch (error) {
        console.log(error.message);

        res.send(messages.catch_error);
    }
}




module.exports = { getBrands, createBrand, deleteBrand, updateBrand, toggleBrand }
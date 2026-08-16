const { generateRandomNames, message } = require("../library/helper");
const ProductModel = require("../models/ProductModel");
const fs = require("fs");
const path = require("path");

// create product
const createProduct = async (req, res) => {
    try {
        const data = req.body;
        const image = req.files?.image;

        if (!image) {
            return res.send(message.general_error("main image is required"));
        }

        const exists = await ProductModel.findOne({
            $or: [
                { sku_id: data.sku_id },
                { slug: data.slug },
                { name: data.name },
            ],
        });

        if (exists) {
            return res.send(message.general_error("product already exists"));
        }

        const imageName = generateRandomNames(image.name);

        const destination = path.join(
            __dirname,
            "../public/images/products/main_images/",
            imageName
        );

        await image.mv(destination);

        await ProductModel.create({
            sku_id: data.sku_id,
            name: data.name,
            slug: data.slug,
            original_price: Number(data.original_price),
            discounted_price: Number(data.discounted_price),
            discount_percentage: Number(data.discount_percentage || 0),
            description: data.description,
            short_description: data.short_description || "",
            image_name: imageName,
            stock: Number(data.stock || 0),

            color_ids: data.color_ids ? JSON.parse(data.color_ids) : [],
            brand_id: data.brand_id || null,

            is_hot: data.is_hot || false,
            is_featured: data.is_featured || false,
            is_best: data.is_best || false,
            is_top: data.is_top || false,
            on_home: data.on_home || false,
        });

        res.send(message.created_msg("product"));

    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};


// =========================
// GET PRODUCTS (UPDATED)
// =========================
const getProducts = async (req, res) => {

    try {

        const query = req.query;
        const filter = {};

        if (query.id) {
            filter._id = query.id;
        }

        if (query.slug) {
            filter.slug = query.slug;
        }

        if (query.status !== undefined) {
            filter.status = query.status === "true";
        }

        if (query.is_hot !== undefined) {
            filter.is_hot = query.is_hot === "true";
        }

        if (query.is_featured !== undefined) {
            filter.is_featured = query.is_featured === "true";
        }

        if (query.is_best !== undefined) {
            filter.is_best = query.is_best === "true";
        }

        if (query.is_top !== undefined) {
            filter.is_top = query.is_top === "true";
        }

        if (query.on_home !== undefined) {
            filter.on_home = query.on_home === "true";
        }

        // BRAND + CATEGORY FILTER
        // Products are connected to categories through Brand.category_ids.
        // If both brand and category are selected, use their intersection.
        let brandIds = query.brand_id
            ? String(query.brand_id).split(",").filter(Boolean)
            : [];

        if (query.category_id) {
            const BrandModel = require("../models/BrandModel");
            const categoryIds = String(query.category_id).split(",").filter(Boolean);

            const brands = await BrandModel.find({
                category_ids: { $in: categoryIds },
            }).select("_id");

            const categoryBrandIds = brands.map((b) => String(b._id));

            brandIds = brandIds.length
                ? brandIds.filter((id) => categoryBrandIds.includes(String(id)))
                : categoryBrandIds;
        }

        if (brandIds.length || query.category_id) {
            filter.brand_id = { $in: brandIds };
        }

        // =========================
        // ✅ COLOR FILTER (MULTI SAFE)
        // =========================
        if (query.color_id) {
            const colorIds = String(query.color_id).split(",");
            filter.color_ids = { $in: colorIds };
        }

        // SEARCH
        if (query.search) {
            filter.$or = [
                {
                    name: {
                        $regex: query.search,
                        $options: "i",
                    },
                },
                {
                    description: {
                        $regex: query.search,
                        $options: "i",
                    },
                },
            ];
        }

        // PRICE FILTER
        if (query.min_price || query.max_price) {

            filter.discounted_price = {};

            if (query.min_price) {
                filter.discounted_price.$gte = Number(query.min_price);
            }

            if (query.max_price) {
                filter.discounted_price.$lte = Number(query.max_price);
            }
        }

        const page = Number(query.page || 1);
        const limit = Number(query.limit || 12);
        const skip = (page - 1) * limit;

        let sort = { createdAt: -1 };

        switch (query.sort) {

            case "price_low":
                sort = { discounted_price: 1 };
                break;

            case "price_high":
                sort = { discounted_price: -1 };
                break;

            case "oldest":
                sort = { createdAt: 1 };
                break;

            case "name_asc":
                sort = { name: 1 };
                break;

            case "popular":
                sort = { total_sales: -1, createdAt: -1 };
                break;

            case "rating":
                sort = { rating: -1, total_reviews: -1 };
                break;

            case "discount":
                sort = { discount_percentage: -1, createdAt: -1 };
                break;

            default:
                sort = { createdAt: -1 };
        }

        const total = await ProductModel.countDocuments(filter);

        const products = await ProductModel.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate({
                path: "brand_id",
                select: "name slug category_ids",
                populate: {
                    path: "category_ids",
                    select: "name slug",
                },
            })
            .populate("color_ids", "name color_code");

        res.send({
            flag: 1,
            total,
            page,
            limit,
            products,
            image_path: "/images/products/main_images/",
            other_image_path: "/images/products/other_images/",
        });

    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};


// add other images
const addOtherImages = async (req, res) => {
    try {
        const { product_id } = req.params;
        const files = req.files?.other_images;

        if (!files) {
            return res.send(message.general_error("images are required"));
        }

        const product = await ProductModel.findById(product_id);

        if (!product) {
            return res.send(message.general_error("product not found"));
        }

        let images = product.other_images || [];

        const saveFile = async (file) => {

            const name = generateRandomNames(file.name);

            const destination = path.join(
                __dirname,
                "../public/images/products/other_images/",
                name
            );

            await file.mv(destination);

            images.push(name);
        };

        if (Array.isArray(files)) {
            for (let file of files) {
                await saveFile(file);
            }
        } else {
            await saveFile(files);
        }

        product.other_images = images;
        await product.save();

        res.send({
            flag: 1,
            msg: "images added",
            current_other_images: images,
        });

    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};


// delete product
const deleteProduct = async (req, res) => {

    try {

        const { id } = req.params;

        const product = await ProductModel.findById(id);

        if (!product) {
            return res.send(message.general_error("product not found"));
        }

        const filePath = path.join(
            __dirname,
            "../public/images/products/main_images/",
            product.image_name
        );

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        if (product.other_images?.length > 0) {

            for (let img of product.other_images) {

                const otherPath = path.join(
                    __dirname,
                    "../public/images/products/other_images/",
                    img
                );

                if (fs.existsSync(otherPath)) {
                    fs.unlinkSync(otherPath);
                }
            }
        }

        await ProductModel.findByIdAndDelete(id);

        res.send(message.delete_msg("product"));

    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};


// toggle product
const toggleProduct = async (req, res) => {

    try {

        const { id, flag } = req.params;

        const product = await ProductModel.findById(id);

        if (!product) {
            return res.send(message.general_error("product not found"));
        }

        const map = {
            1: "status",
            2: "on_home",
            3: "is_featured",
            4: "is_top",
            5: "is_hot",
            6: "is_best",
        };

        const field = map[flag];

        if (!field) {
            return res.send(message.general_error("invalid flag"));
        }

        product[field] = !product[field];
        await product.save();

        res.send(message.general_success("toggled successfully"));

    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};


// delete other image
const deleteOtherImages = async (req, res) => {

    try {

        const { product_id, idx } = req.params;

        const product = await ProductModel.findById(product_id);

        if (!product) {
            return res.send(message.general_error("product not found"));
        }

        const images = product.other_images || [];

        if (!images[idx]) {
            return res.send(message.general_error("image not found"));
        }

        const filePath = path.join(
            __dirname,
            "../public/images/products/other_images/",
            images[idx]
        );

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        images.splice(idx, 1);

        product.other_images = images;
        await product.save();

        res.send({
            flag: 1,
            msg: "image deleted",
            current_other_images: images,
        });

    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};


// update product
const updateProduct = async (req, res) => {

    try {

        const { id } = req.params;
        const data = req.body;
        const image = req.files?.image;

        const product = await ProductModel.findById(id);

        if (!product) {
            return res.send(message.general_error("product not found"));
        }

        const duplicate = await ProductModel.findOne({
            _id: { $ne: id },
            $or: [
                { name: data.name },
                { slug: data.slug },
                { sku_id: data.sku_id },
            ],
        });

        if (duplicate) {
            return res.send(message.general_error("name, slug or sku already exists"));
        }

        if (image) {

            const oldPath = path.join(
                __dirname,
                "../public/images/products/main_images/",
                product.image_name
            );

            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            const imageName = generateRandomNames(image.name);

            const destination = path.join(
                __dirname,
                "../public/images/products/main_images/",
                imageName
            );

            await image.mv(destination);

            product.image_name = imageName;
        }

        product.sku_id = data.sku_id;
        product.name = data.name;
        product.slug = data.slug;
        product.original_price = Number(data.original_price);
        product.discounted_price = Number(data.discounted_price);
        product.discount_percentage = Number(data.discount_percentage || 0);
        product.description = data.description;
        product.short_description = data.short_description || "";
        product.stock = Number(data.stock || 0);
        product.brand_id = data.brand_id || null;
        product.color_ids = data.color_ids ? JSON.parse(data.color_ids) : [];

        await product.save();

        res.send(message.general_success("product updated"));

    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};


module.exports = {
    createProduct,
    getProducts,
    toggleProduct,
    deleteProduct,
    deleteOtherImages,
    addOtherImages,
    updateProduct,
};
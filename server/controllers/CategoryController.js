const CategoryModel=require("../models/CategoryModel");
const BrandModel = require("../models/BrandModel");
const ProductModel = require("../models/ProductModel");
const { generateRandomNames, message } = require("../library/helper");
const path = require("path");
const fs = require("fs");



// getCATEGORIES function  to give response if receive get request from client
const getCategories = async (req, res) => {
    try {
        const query = req.query; /* extracting query */
        const filter = {};/* initial value empty object */

        if (query.id) {
            filter._id = query.id;/* find by id */
        }

        if (query.slug) {
            filter.slug = query.slug;/* find by slug */
        }

        if (query.status !== undefined) {
            filter.status = query.status == "true";
        }

        if (query.on_home !== undefined) {
            filter.on_home = query.on_home == "true";
        }

        if (query.is_top !== undefined) {
            filter.is_top = query.is_top == "true";
        }


        if (
            query.is_featured !==
            undefined
        ) {

            filter.is_featured =
                query.is_featured ==
                "true";
        }

// ***search query****
        if (query.search) {

            filter.name = {
                $regex: query.search,
                $options: "i",
            };
        }
        // console.log(filter);

        const categories = await CategoryModel.find(filter).sort({ createdAt: -1 }).lean();

        // Products are connected to categories through Brand.category_ids.
        // So category product count is calculated from products whose brand belongs to that category.
        const categoryIds = categories.map((category) => category._id);
        const brands = categoryIds.length
            ? await BrandModel.find({ category_ids: { $in: categoryIds } }).select("_id category_ids").lean()
            : [];

        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const brandIds = brands
                    .filter((brand) => (brand.category_ids || []).some((catId) => String(catId) === String(category._id)))
                    .map((brand) => brand._id);

                const product_count = brandIds.length
                    ? await ProductModel.countDocuments({ brand_id: { $in: brandIds } })
                    : 0;

                return {
                    ...category,
                    product_count,
                };
            })
        );

        // Get or read operation
        res.send(
            {
                count: Array.isArray(categoriesWithCount) && categoriesWithCount.length,
                flag: 1, //success
                categories: categoriesWithCount,
                image_path: "/images/categories/",
            }
        )
    } catch (error) {
        res.send(message.catch_error);
    }
}


// create function used to handle post request when client send data through post method

const createCategory = async (req, res) => {
    try {
        const data = req.body;
        const image = req.files?.image;
        const categoryExists = await CategoryModel.findOne({
            $or: [{ name: data.name }, { slug: data.slug }],
        });

        if (categoryExists) {
            return res.send(message.general_error("Name and slug must be unique"));
        }
        let imageName = "";

        if (image) {

            imageName =
                generateRandomNames(
                    image.name
                );

            const destination =
                path.join(
                    __dirname,
                    "../public/images/categories/",
                    imageName
                );

            await image.mv(destination);
        }

        const category = new CategoryModel({
            name: data.name,
            slug: data.slug,
            image_name: imageName,
        });

        await category.save();
        res.send(message.created_msg("Category"))


    } catch (error) {
        console.log(error.msg);
        console.log(error.message);
        res.send(message.catch_error)
    }
}

// function  to delete category 
const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await CategoryModel.findById(id);
        if (!category) {
            return res.send(message.general_error("Category not found"));
        }
        const filePath = path.join(
            __dirname,
            "../public/images/categories/",
            category.image_name
        );

        if (fs.existsSync(filePath)) {

            fs.unlinkSync(filePath);
        }

        await CategoryModel.findByIdAndDelete(id);
        res.send(message.delete_msg("Category"));
    } catch (error) {
        res.send(message.catch_error)
    }
}


// toggleCategory function to toggle categories

const toggleCategory = async (req, res) => {
    try {
        const { id, flag } = req.params;
        // flag, 1:status 2:On_home 3:Is_featured 4:Is_top
        const category = await CategoryModel.findById(id);
        if (category) {
            if (flag == 1) {
                category.status = !category.status;
            } else if (flag == 2) {
                category.on_home = !category.on_home;
            } else if (flag == 3) {
                category.is_featured = !category.is_featured;
            } else if (flag == 4) {
                category.is_top = !category.is_top;
            }
            await category.save();
            res.send(message.general_success("Toggled successfully!"));
        } else {
            res.send(message.general_error("Category not found"));
        }
    } catch (error) {
        res.send(message.catch_error);
    }
}

//   function to update category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const image = req.files?.image;
        const { name, slug } = req.body;
        const category = await CategoryModel.findById(id);
        if (!category) {
            return res.send(message.general_error("Category not found"));
        }

        if (image) {
            const imageName = generateRandomNames(image.name);
            const destination = "./public/images/categories/" + imageName
            await image.mv(destination);
            await fs.unlinkSync(`./public/images/categories/${category.image_name}`);
            category.image_name = imageName;
        }
        category.name = name;
        category.slug = slug;
        await category.save();
        return res.send(message.general_success("category updated"));
    } catch (error) {
        res.send(message.catch_error);
    }
}



module.exports = { getCategories, createCategory, updateCategory, toggleCategory, deleteCategory };
"use client";

import { apiClient, titleToSlug, getAuthHeader } from "@/library/helper";
import { useRef,useState } from "react";
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function AddProductPage() {
    const nameRef = useRef(null);
    const slugRef = useRef(null);
    const skuRef = useRef(null);

    const originalPriceRef = useRef(null);
    const discountedPriceRef = useRef(null);
    const discountPercentageRef = useRef(null);

    const descriptionRef = useRef(null);

    const imageRef = useRef(null);

    const [preview, setPreview] = useState(null);
    const [fileName, setFileName] = useState("");

    const [brands, setBrands] = useState([]);
    const [colors, setColors] = useState([]);

    const [selectedColors, setSelectedColors] = useState([]);

    const [brandId, setBrandId] = useState("");

    // auto generate slug
    const nameChangeHandler = () => {

        const slug = titleToSlug(nameRef.current.value);

        slugRef.current.value = slug;

    };
    // image preview
    const imagePreviewHandler = (e) => {

        const file = e.target.files[0];

        if (file) {

            setPreview(URL.createObjectURL(file));

            setFileName(file.name);

        }

    };

    // remove image
    const removeImageHandler = () => {

        setPreview(null);

        setFileName("");

        if (imageRef.current) {

            imageRef.current.value = "";

        }

    };

    // fetch brand and colors
    const fetchData = async () => {
        try {
            const [brandRes, colorRes] = await Promise.all([
                apiClient.get("/brand"),
                apiClient.get("/color"),
            ]);

            if (brandRes.data.flag==1) {
                setBrands(brandRes.data.brands);
            }
            if (colorRes.data.flag == 1) {
                setColors(colorRes.data.colors);
            }
        } catch (error) {
            toast.error("Failed to load data");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const calculateDiscount = () => {
        const original = Number(originalPriceRef.current.value);
        const discounted = Number(discountedPriceRef.current.value);

        if (original > 0 && discounted > 0) {
            const percentage = Math.round(
                ((original - discounted) / original) * 100
            );
            discountPercentageRef.current.value = percentage;
        }
    };

    // color select
    const colorHandler = (id) => {
        if (selectedColors.includes(id)) {
            setSelectedColors(
                selectedColors.filter((item) => item !== id)
            );
        } else {
            setSelectedColors([...selectedColors, id]);
        }
    };

    // submit form

    const submitHandler = async (e) => {

        e.preventDefault();

        if (
            nameRef.current.value.trim() === "" ||
            slugRef.current.value.trim() === "" ||
            skuRef.current.value.trim() === "" ||
            originalPriceRef.current.value.trim() === "" ||
            discountedPriceRef.current.value.trim() === ""
        ) {

            toast.warning("Please fill all required fields");

            return;

        }

        try {

            const image_file = imageRef.current.files[0];

            const formData = new FormData();

            formData.append("name", nameRef.current.value);

            formData.append("slug", slugRef.current.value);

            formData.append("sku_id", skuRef.current.value);

            formData.append(
                "original_price",
                originalPriceRef.current.value
            );

            formData.append(
                "discounted_price",
                discountedPriceRef.current.value
            );

            formData.append(
                "discount_percentage",
                discountPercentageRef.current.value
            );

            formData.append(
                "description",
                descriptionRef.current.value
            );

            formData.append(
                "brand_id",
                brandId
            );

            formData.append(
                "color_ids",
                JSON.stringify(selectedColors)
            );

            if (image_file) {

                formData.append("image", image_file);

            }

            const response = await apiClient.post(
                "/product/create",
                formData,getAuthHeader()
            );

            if (response.data.flag == 1) {

                toast.success(response.data.msg);

                e.target.reset();

                setPreview(null);

                setFileName("");

                setSelectedColors([]);

                setBrandId("");

            } else {

                toast.warning(response.data.msg);

            }

        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");

        }
    };
    
        return (

        <div className="admin-page space-y-6">

            {/* header */}
            <div className="admin-page-header">

                <div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Add New Product
                    </h1>

                    <p className="mt-1 text-sm sm:text-base text-gray-600">
                        Create a new product
                    </p>

                </div>

                <Link
                    href="/admin/product"
                    className="flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 w-fit"
                >

                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >

                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />

                    </svg>

                    Back to Products

                </Link>

            </div>

            {/* form */}
            <div className="admin-panel-card p-4 sm:p-6">

                <form
                    onSubmit={submitHandler}
                    encType="multipart/form-data"
                    className="space-y-6"
                >

                    {/* product name */}
                    <div>

                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >

                            Product Name
                            <span className="text-red-500">*</span>

                        </label>

                        <input
                            type="text"
                            id="name"
                            ref={nameRef}
                            onChange={nameChangeHandler}
                            placeholder="Enter product name"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        />

                    </div>

                    {/* slug and sku */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div>

                            <label
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >

                                Slug
                                <span className="text-red-500">*</span>

                            </label>

                            <input
                                type="text"
                                readOnly
                                ref={slugRef}
                                placeholder="product-slug"
                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm sm:text-base focus:outline-none"
                            />

                        </div>

                        <div>

                            <label
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >

                                SKU ID
                                <span className="text-red-500">*</span>

                            </label>

                            <input
                                type="text"
                                ref={skuRef}
                                placeholder="Enter sku id"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                            />

                        </div>

                    </div>

                    {/* prices */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        <div>

                            <label
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >

                                Original Price
                                <span className="text-red-500">*</span>

                            </label>

                            <input
                                type="number"
                                ref={originalPriceRef}
                                onChange={calculateDiscount}
                                placeholder="Enter original price"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                            />

                        </div>

                        <div>

                            <label
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >

                                Discounted Price
                                <span className="text-red-500">*</span>

                            </label>

                            <input
                                type="number"
                                ref={discountedPriceRef}
                                onChange={calculateDiscount}
                                placeholder="Enter discounted price"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                            />

                        </div>

                        <div>

                            <label
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >

                                Discount %

                            </label>

                            <input
                                type="number"
                                readOnly
                                ref={discountPercentageRef}
                                placeholder="0%"
                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm sm:text-base focus:outline-none"
                            />

                        </div>

                    </div>

                    {/* brand */}
                    <div>

                        <label
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >

                            Brand

                        </label>

                        <select
                            value={brandId}
                            onChange={(e) => setBrandId(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        >

                            <option value="">
                                Select Brand
                            </option>

                            {brands.map((brand) => (

                                <option
                                    key={brand._id}
                                    value={brand._id}
                                >

                                    {brand.name}

                                </option>

                            ))}

                        </select>

                    </div>

                    {/* colors */}
                    <div>

                        <label
                            className="mb-3 block text-sm font-medium text-gray-700"
                        >

                            Select Colors

                        </label>

                        <div className="flex flex-wrap gap-3">

                            {colors.map((color) => (

                                <button
                                    key={color._id}
                                    type="button"
                                    onClick={() => colorHandler(color._id)}
                                    className={`px-4 py-2 rounded-lg border text-sm transition-all
                                        
                                    ${selectedColors.includes(color._id)
                                            ? "bg-slate-950 text-white border-slate-950"
                                            : "bg-white text-gray-700 border-gray-300"
                                        }`}
                                >

                                    {color.name}

                                </button>

                            ))}

                        </div>

                    </div>

                    {/* description */}
                    <div>

                        <label
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >

                            Description

                        </label>

                        <textarea
                            rows={5}
                            ref={descriptionRef}
                            placeholder="Enter product description"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-none"
                        />

                    </div>

                    {/* image upload */}
                    <div>

                        <label
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >

                            Product Image
                            <span className="text-red-500">*</span>

                        </label>

                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            ref={imageRef}
                            onChange={imagePreviewHandler}
                            className="hidden"
                            id="image"
                        />

                        <label
                            htmlFor="image"
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer rounded-lg border border-gray-300 px-4 py-3 hover:border-slate-900"
                        >

                            <div className="flex items-center gap-3 overflow-hidden">

                                <svg
                                    className="h-5 w-5 text-gray-500 shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 10.828a4 4 0 10-5.656-5.656L5.757 11.757a6 6 0 108.486 8.486L20.5 14"
                                    />

                                </svg>

                                <span className="truncate text-sm text-gray-600">

                                    {fileName || "Choose Image"}

                                </span>

                            </div>

                            {fileName && (

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        removeImageHandler();
                                    }}
                                    className="self-end sm:self-auto text-gray-400 hover:text-red-500"
                                >

                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />

                                    </svg>

                                </button>

                            )}

                        </label>

                        <p className="mt-2 text-xs text-gray-500">
                            PNG or JPEG supported
                        </p>

                        {preview && (

                            <div className="mt-4">

                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="h-28 w-28 sm:h-32 sm:w-32 rounded-lg border border-gray-200 object-cover"
                                />

                            </div>

                        )}

                    </div>

                    {/* actions */}
                    <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 border-t border-gray-200 pt-4">

                        <Link
                            href="/admin/product"
                            className="w-full sm:w-auto text-center rounded-lg border border-gray-300 px-6 py-2.5 text-gray-700 hover:bg-gray-50"
                        >

                            Cancel

                        </Link>

                        <button
                            type="submit"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 py-2.5 text-white hover:bg-slate-800"
                        >

                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />

                            </svg>

                            Create Product

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );


}
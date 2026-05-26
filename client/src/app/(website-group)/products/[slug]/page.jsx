"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Minus, Plus, ShoppingCart, Truck, ShieldCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addToCartApi, getProduct } from "@/library/api-call";
import { buildImageUrl } from "@/library/helper";
import { addToCart, syncCart } from "@/redux/reducers/CartReducers";

// format price in indian currency
const formatPrice = (value = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const getStockInfo = (product) => {
    // prepare stock limit and label
    const numericStock = Number(product?.stock);
    const hasPositiveStock = Number.isFinite(numericStock) && numericStock > 0;

    return {
        maxQty: hasPositiveStock ? numericStock : 99,
        label: hasPositiveStock ? `${numericStock} in stock` : "In stock",
    };
};

export default function ProductDetailsPage() {
    const params = useParams();
    const dispatch = useDispatch();
    const token = useSelector((state) => state.user?.token);

    // store product page data
    const [product, setProduct] = useState(null);
    const [imagePath, setImagePath] = useState("");
    const [otherImagePath, setOtherImagePath] = useState("");
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedColor, setSelectedColor] = useState(null);
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(true);
    const [cartLoading, setCartLoading] = useState(false);

    useEffect(() => {
        // load product when slug changes
        loadProduct();
    }, [params?.slug]);

    async function loadProduct() {
        setLoading(true);

        const response = await getProduct({
            slug: params?.slug,
            status: true,
            limit: 1,
        });

        const currentProduct = response.products?.[0] || null;
        setProduct(currentProduct);
        setImagePath(response.image_path || "");
        setOtherImagePath(response.other_image_path || "");

        if (currentProduct?.image_name) {
            // set main image as default
            setSelectedImage(buildImageUrl(response.image_path, currentProduct.image_name));
        }

        // select first color by default
        const firstColor = currentProduct?.color_ids?.[0] || null;
        setSelectedColor(firstColor);

        setLoading(false);
    }

    const gallery = useMemo(() => {
        // build product image gallery
        if (!product) return [];

        const images = [buildImageUrl(imagePath, product.image_name)];

        (product.other_images || []).forEach((image) => {
            images.push(buildImageUrl(otherImagePath, image));
        });

        return images.filter(Boolean);
    }, [product, imagePath, otherImagePath]);

    const price = Number(product?.discounted_price || product?.price || 0);
    const originalPrice = Number(product?.original_price || product?.price || price);
    const discount = Number(
        // calculate discount if not provided
        product?.discount_percentage ||
            (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0)
    );
    const stockInfo = getStockInfo(product);

    const handleAddToCart = async () => {
        if (!product?._id) return;

        // require color if variants exist
        const colorRequired = (product.color_ids || []).length > 0;
        if (colorRequired && !selectedColor?._id) {
            toast.error("Please select a color");
            return;
        }

        const selectedColorPayload = selectedColor
            // keep selected color in cart
            ? {
                  _id: selectedColor._id,
                  color_id: selectedColor._id,
                  name: selectedColor.name,
                  color_code: selectedColor.color_code,
              }
            : null;

        if (!token) {
            // save guest cart locally
            dispatch(addToCart({
                ...product,
                image_path: imagePath,
                quantity: qty,
                color_id: selectedColorPayload?._id || null,
                selected_color: selectedColorPayload,
            }));
            toast.success("Added to cart");
            setQty(1);
            return;
        }

        setCartLoading(true);

        try {
            // save logged-in cart on server
            const response = await addToCartApi({
                product_id: product._id,
                qty,
                color_id: selectedColorPayload?._id || null,
            });

            if (response.flag === 1) {
                dispatch(syncCart(response.cart || []));
                toast.success(response.msg || "Added to cart");
                setQty(1);
            } else {
                toast.error(response.msg || "Could not add product");
            }
        } catch (error) {
            toast.error("Could not add product");
        } finally {
            setCartLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] bg-slate-50 px-4 py-10">
                {/* product loading skeleton */}
                <div className="mx-auto max-w-7xl animate-pulse rounded-2xl bg-white p-6">
                    <div className="grid gap-8 lg:grid-cols-2">
                        <div className="h-[480px] rounded-2xl bg-slate-100" />
                        <div className="space-y-5">
                            <div className="h-9 rounded bg-slate-100" />
                            <div className="h-24 rounded bg-slate-100" />
                            <div className="h-12 rounded bg-slate-100" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="bg-slate-50 px-4 py-24 text-center">
                <h1 className="text-3xl font-semibold text-slate-950">Product not found</h1>
                <p className="mt-3 text-slate-500">Product inactive ya unavailable ho sakta hai.</p>
                <Link href="/products" className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white">
                    Back to Products
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Link href="/products" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950">
                    <ArrowLeft size={17} /> Back to products
                </Link>

                <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-4 lg:grid-cols-[1fr_1fr] lg:p-6">
                    <div>
                        <div className="overflow-hidden rounded-2xl bg-slate-100">
                            <img src={selectedImage || gallery[0]} alt={product.name} className="h-[360px] w-full object-contain sm:h-[480px]" />
                        </div>

                        {/* product thumbnails */}
                        {gallery.length > 1 && (
                            <div className="mt-3 grid grid-cols-5 gap-2">
                                {gallery.map((image) => (
                                    <button
                                        key={image}
                                        type="button"
                                        onClick={() => setSelectedImage(image)}
                                        className={`overflow-hidden rounded-xl border ${selectedImage === image ? "border-slate-950" : "border-slate-200"}`}
                                    >
                                        <img src={image} alt={product.name} className="h-20 w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col justify-center py-2 lg:py-6">
                        {/* product badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                {product.brand_id?.name || "iShop"}
                            </span>
                            {discount > 0 && (
                                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                                    {discount}% off
                                </span>
                            )}
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                {stockInfo.label}
                            </span>
                        </div>

                        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                            {product.name}
                        </h1>

                        <p className="mt-4 max-w-2xl leading-7 text-slate-600">
                            {product.short_description || product.description}
                        </p>

                        <div className="mt-6 flex flex-wrap items-end gap-3">
                            <p className="text-3xl font-semibold text-slate-950">{formatPrice(price)}</p>
                            {originalPrice > price && (
                                <p className="pb-1 text-lg text-slate-400 line-through">{formatPrice(originalPrice)}</p>
                            )}
                        </div>

                        {/* color options */}
                        {(product.color_ids || []).length > 0 && (
                            <div className="mt-5">
                                <p className="mb-2 text-sm font-medium text-slate-700">Select color</p>
                                <div className="flex flex-wrap gap-2">
                                    {(product.color_ids || []).map((color) => {
                                        const active = String(selectedColor?._id || "") === String(color._id);
                                        return (
                                            <button
                                                key={color._id}
                                                type="button"
                                                onClick={() => setSelectedColor(color)}
                                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 text-slate-700 hover:border-slate-400"}`}
                                            >
                                                <span className="h-4 w-4 rounded-full border border-slate-200" style={{ backgroundColor: color.color_code || "#e2e8f0" }} />
                                                {color.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* quantity and cart button */}
                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            <div className="flex h-12 items-center rounded-full border border-slate-200 bg-white">
                                <button type="button" onClick={() => setQty((prev) => Math.max(1, prev - 1))} className="grid h-full w-12 place-items-center text-slate-600 hover:text-slate-950">
                                    <Minus size={16} />
                                </button>
                                <span className="min-w-10 text-center font-semibold">{qty}</span>
                                <button type="button" onClick={() => setQty((prev) => Math.min(stockInfo.maxQty, prev + 1))} className="grid h-full w-12 place-items-center text-slate-600 hover:text-slate-950">
                                    <Plus size={16} />
                                </button>
                            </div>

                            <button
                                type="button"
                                disabled={cartLoading}
                                onClick={handleAddToCart}
                                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ShoppingCart size={18} />
                                {cartLoading ? "Adding" : "Add to Cart"}
                            </button>
                        </div>

                        {/* trust info cards */}
                        <div className="mt-7 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 p-4">
                                <Truck className="mb-3 text-slate-700" size={22} />
                                <p className="font-semibold text-slate-950">Fast delivery</p>
                                <p className="mt-1 text-sm text-slate-500">Simple checkout-ready cart flow.</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 p-4">
                                <ShieldCheck className="mb-3 text-slate-700" size={22} />
                                <p className="font-semibold text-slate-950">Saved cart</p>
                                <p className="mt-1 text-sm text-slate-500">Logged-in add is saved in database.</p>
                            </div>
                        </div>

                      
                    </div>
                </div>
            </div>
        </div>
    );
}
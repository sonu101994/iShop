"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addToCartApi } from "@/library/api-call";
import { addToCart, syncCart } from "@/redux/reducers/CartReducers";
import { buildImageUrl } from "@/library/helper";

// price format
const formatPrice = (value = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

    // stock available||fallback
const getStockInfo = (product) => {
    const rawStock = product?.stock;
    const numericStock = Number(rawStock);
    const hasPositiveStock = Number.isFinite(numericStock) && numericStock > 0;

    return {
        maxQty: hasPositiveStock ? numericStock : 99,
        label: hasPositiveStock ? `${numericStock} left` : "In stock",
    };
};

export default function ProductCard({ product, imagePath }) {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.user?.token);

    // qty
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(false);

    if (!product) return null;

    const price = Number(product.discounted_price || product.discount_price || product.price || 0);
    const originalPrice = Number(product.original_price || product.price || price);
    const discount = Number(
        // discount percentage missing ho to price difference se calculate karte hain
        product.discount_percentage ||
            (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0)
    );
    const image = buildImageUrl(imagePath, product.image_name);
    const brandName = product.brand_id?.name;
    const stockInfo = getStockInfo(product);
    const defaultColor = product.color_ids?.[0] || null;
    const selectedColorPayload = defaultColor
        ? {
              _id: defaultColor._id,
              color_id: defaultColor._id,
              name: defaultColor.name,
              color_code: defaultColor.color_code,
          }
        : null;

    const handleAddToCart = async () => {
        // product id missing ho to cart payload
        if (!product?._id) {
            toast.error("Product data missing");
            return;
        }

        if (!token) {
            // guest user 
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

        setLoading(true);

        try {
            // logged-in user ka cart backend me save 
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
            setLoading(false);
        }
    };

    return (
        <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md">
            {/* image click product detail page par le jata hai */}
            <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
                {discount > 0 && (
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-sm">
                        {discount}% off
                    </span>
                )}
                <img
                    src={image}
                    alt={product.name}
                    className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                />
            </Link>

            <div className="p-4">
                <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="truncate">{brandName || "iShop"}</span>
                    <span>{stockInfo.label}</span>
                </div>

                <Link href={`/products/${product.slug}`}>
                    <h3 className="line-clamp-2 min-h-[44px] text-[15px] font-semibold leading-5 text-slate-950 group-hover:text-slate-700">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-3 flex items-end gap-2">
                    <p className="text-lg font-semibold text-slate-950">{formatPrice(price)}</p>
                    {originalPrice > price && (
                        <p className="pb-0.5 text-sm text-slate-400 line-through">{formatPrice(originalPrice)}</p>
                    )}
                </div>
                    {/* qty + and -|default 1 */}
                <div className="mt-4 flex items-center gap-2">
                    <div className="flex h-10 items-center rounded-full border border-slate-200 bg-white">
                        <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                            className="grid h-full w-9 place-items-center text-slate-600 hover:text-slate-950"
                        >
                            <Minus size={14} />
                        </button>

                        <span className="min-w-8 text-center text-sm font-semibold text-slate-950">{qty}</span>

                        <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => setQty((prev) => Math.min(stockInfo.maxQty, prev + 1))}
                            className="grid h-full w-9 place-items-center text-slate-600 hover:text-slate-950"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleAddToCart}
                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ShoppingCart size={16} />
                        {loading ? "Adding" : "Add"}
                    </button>
                </div>
            </div>
        </article>
    );
}

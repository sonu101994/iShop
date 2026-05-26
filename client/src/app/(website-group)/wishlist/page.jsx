"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addToCartApi, deleteWishlistItem, getWishlist } from "@/library/api-call";
import { addToCart, syncCart } from "@/redux/reducers/CartReducers";
import { buildImageUrl } from "@/library/helper";

// local storage key for guest wishlist
const GUEST_WISHLIST_KEY = "ishop_guest_wishlist";

const formatPrice = (value = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const normalizeWishlistItem = (item = {}) => {
    // make server and guest data same
    const product = item.product || item.product_id || item;
    return {
        wishlist_id: item.wishlist_id || item._id,
        product,
        image_path: item.image_path || product.image_path || "/images/products/main_images/",
    };
};

export default function WishlistPage() {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.user?.token);

    // store wishlist and button state
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState("");

    useEffect(() => {
        let active = true;

        async function loadWishlist() {
            setLoading(true);

            if (token) {
                // load wishlist from server
                const response = await getWishlist();
                if (active) setItems((response.wishlist || []).map(normalizeWishlistItem));
            } else if (typeof window !== "undefined") {
                // load guest wishlist from browser
                const localItems = JSON.parse(localStorage.getItem(GUEST_WISHLIST_KEY) || "[]");
                if (active) setItems(Array.isArray(localItems) ? localItems.map(normalizeWishlistItem) : []);
            }

            if (active) setLoading(false);
        }

        loadWishlist();

        return () => {
            active = false;
        };
    }, [token]);

    const removeGuestWishlist = (productId) => {
        if (typeof window === "undefined") return;

        // remove item from local wishlist
        const next = items.filter((item) => String(item.product?._id) !== String(productId));
        localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(next.map((item) => ({ ...item.product, image_path: item.image_path }))));
        setItems(next);
    };

    const handleRemove = async (item) => {
        const product = item.product;
        const productId = product?._id;
        if (!productId) return;

        setBusyId(String(productId));

        if (token) {
            // remove wishlist item from server
            const response = await deleteWishlistItem(item.wishlist_id || productId);
            if (response.flag === 1) {
                setItems((response.wishlist || []).map(normalizeWishlistItem));
                toast.success(response.msg || "Removed from wishlist");
            } else {
                toast.error(response.msg || "Could not remove wishlist item");
            }
        } else {
            removeGuestWishlist(productId);
            toast.success("Removed from wishlist");
        }

        setBusyId("");
    };

    const handleAddToCart = async (item) => {
        const product = item.product;
        if (!product?._id) return;

        setBusyId(String(product._id));

        if (token) {
            // add item to server cart
            const response = await addToCartApi({ product_id: product._id, qty: 1 });
            if (response.flag === 1) {
                dispatch(syncCart(response.cart || []));
                toast.success("Added to cart");
            } else {
                toast.error(response.msg || "Could not add to cart");
            }
        } else {
            // add item to guest cart
            dispatch(addToCart({ ...product, image_path: item.image_path, quantity: 1 }));
            toast.success("Added to cart");
        }

        setBusyId("");
    };

    return (
        <div className="bg-slate-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Wishlist</p>
                        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Saved products</h1>
                    </div>
                    <Link href="/products" className="inline-flex w-fit rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-400">
                        Continue shopping
                    </Link>
                </div>

                {/* show loading, empty, or wishlist items */}
                {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => <div key={item} className="h-80 animate-pulse rounded-2xl bg-white" />)}
                    </div>
                ) : !items.length ? (
                    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-700">
                            <Heart size={24} />
                        </div>
                        <h2 className="mt-5 text-xl font-semibold text-slate-950">Wishlist is empty</h2>
                        <p className="mt-2 text-slate-500">Move cart items to wishlist or save products for later.</p>
                        <Link href="/products" className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white">
                            Browse products
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {items.map((item) => {
                            // prepare product card data
                            const product = item.product || {};
                            const price = Number(product.discounted_price || product.discount_price || product.price || 0);
                            const originalPrice = Number(product.original_price || product.price || price);
                            const image = buildImageUrl(item.image_path || "/images/products/main_images/", product.image_name);
                            const busy = busyId === String(product._id);

                            return (
                                <article key={product._id || item.wishlist_id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                    <Link href={`/products/${product.slug || ""}`} className="block aspect-[4/3] overflow-hidden bg-slate-100">
                                        <img src={image} alt={product.name || "Product"} className="h-full w-full object-cover" />
                                    </Link>
                                    <div className="p-4">
                                        <p className="text-xs text-slate-500">{product.brand_id?.name || "iShop"}</p>
                                        <Link href={`/products/${product.slug || ""}`} className="mt-1 block line-clamp-2 min-h-[44px] font-semibold text-slate-950 hover:text-slate-700">
                                            {product.name || "Product"}
                                        </Link>
                                        <div className="mt-3 flex items-end gap-2">
                                            <p className="text-lg font-semibold text-slate-950">{formatPrice(price)}</p>
                                            {originalPrice > price && <p className="pb-0.5 text-sm text-slate-400 line-through">{formatPrice(originalPrice)}</p>}
                                        </div>

                                        {/* card action buttons */}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleAddToCart(item)}
                                                disabled={busy}
                                                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                                            >
                                                <ShoppingCart size={16} /> Add
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRemove(item)}
                                                disabled={busy}
                                                className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
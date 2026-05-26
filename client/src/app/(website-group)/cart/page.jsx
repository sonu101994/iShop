"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
    clearCart,
    decreaseQuantity,
    getCartDocumentId,
    getCartItemKey,
    getCartProductId,
    getCartSelectedColor,
    increaseQuantity,
    removeFromCart,
    restoreCart,
    setCartItemQuantity,
    syncCart,
} from "@/redux/reducers/CartReducers";
import { buildImageUrl } from "@/library/helper";
import { addToWishlist, clearCartApi, deleteCartItem, getCartItems, updateCartQty } from "@/library/api-call";

// guest user ki wishlist 
const GUEST_WISHLIST_KEY = "ishop_guest_wishlist";

// price ko indian rupee format 
const formatPrice = (value = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const getPrice = (item) => Number(item.discounted_price || item.discount_price || item.price || item.unit_price || 0);
// stock missing 
const getStockMax = (item) => {
    const stock = Number(item?.stock);
    return Number.isFinite(stock) && stock > 0 ? stock : 99;
};

const getCartApiId = (item) => getCartDocumentId(item) || getCartProductId(item);

const saveGuestWishlist = (item) => {
    // only on ls not backend
    if (typeof window === "undefined") return;
    const existing = JSON.parse(localStorage.getItem(GUEST_WISHLIST_KEY) || "[]");
    const productId = getCartProductId(item);
    const next = Array.isArray(existing) ? existing.filter((wish) => String(getCartProductId(wish)) !== String(productId)) : [];
    next.unshift(item);
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(next));
};

export default function CartPage() {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.user?.token);
    const cartItems = useSelector((state) => state.cart?.cartItems || []);
    const [loadingCart, setLoadingCart] = useState(true);
    const [busyId, setBusyId] = useState("");

    useEffect(() => {
        // token change 
        let active = true;

        async function loadCart() {
            setLoadingCart(true);

            if (token) {
                // logged-in customer ka cart backend se 
                const response = await getCartItems();
                if (active) {
                    if (response.flag === 1) {
                        dispatch(syncCart(response.cart || []));
                    } else {
                        toast.error(response.msg || "Could not load cart");
                    }
                }
            } else {
                // guest cart  se local storage/redux me 
                dispatch(restoreCart());
            }

            if (active) setLoadingCart(false);
        }

        loadCart();

        return () => {
            active = false;
        };
    }, [token, dispatch]);

    const subtotal = useMemo(
        // subtotal har render par dobara calculate na ho, cart items change hone par hi update ho
        () => cartItems.reduce((total, item) => total + getPrice(item) * Number(item.quantity || 1), 0),
        [cartItems]
    );
    const totalQty = useMemo(
        () => cartItems.reduce((total, item) => total + Number(item.quantity || 1), 0),
        [cartItems]
    );

    const handleQuantityChange = async (item, nextQty) => {
        // quantity change me guest cart local update hota hai aur logged-in cart api se update hota hai
        const productId = getCartProductId(item);
        const apiId = getCartApiId(item);
        const currentQty = Number(item.quantity || 1);
        const safeQty = Math.max(1, Number(nextQty || 1));

        if (!productId) return;
        if (safeQty > getStockMax(item)) {
            //  available stock quantity 
            toast.info("Maximum available quantity selected");
            return;
        }

        if (!token) {
            dispatch(setCartItemQuantity({ ...item, qty: safeQty }));
            return;
        }

        if (!apiId) {
            toast.error("Cart item id missing. Please refresh cart.");
            return;
        }

        setBusyId(String(productId));
        const response = await updateCartQty(apiId, safeQty);
        if (response.flag === 1) {
            dispatch(syncCart(response.cart || []));
        } else {
            toast.error(response.msg || "Could not update quantity");
        }
        setBusyId("");
    };

    const handleRemove = async (item) => {
        // remove action with token|| without token
        const productId = getCartProductId(item);
        const apiId = getCartApiId(item);
        if (!productId) return;

        if (!token) {
            dispatch(removeFromCart(item));
            toast.success("Removed from cart");
            return;
        }

        if (!apiId) {
            toast.error("Cart item id missing. Please refresh cart.");
            return;
        }

        setBusyId(String(productId));
        const response = await deleteCartItem(apiId);
        if (response.flag === 1) {
            dispatch(syncCart(response.cart || []));
            toast.success(response.msg || "Removed from cart");
        } else {
            toast.error(response.msg || "Could not remove from cart");
        }
        setBusyId("");
    };

    const handleClearCart = async () => {
        // if already empty
        if (!cartItems.length) return;

        // handle both db and local cart
        if (!token) {
            dispatch(clearCart());
            toast.success("Cart cleared");
            return;
        }

        setBusyId("clear");
        const response = await clearCartApi();
        if (response.flag === 1) {
            dispatch(clearCart());
            toast.success(response.msg || "Cart cleared");
        } else {
            toast.error(response.msg || "Could not clear cart");
        }
        setBusyId("");
    };

    const handleMoveToWishlist = async (item) => {
        // move to wishlist 
        const productId = getCartProductId(item);
        if (!productId) return;

        setBusyId(`wish-${productId}`);

        if (token) {
            const response = await addToWishlist(productId);
            if (response.flag !== 1) {
                toast.error(response.msg || "Could not add to wishlist");
                setBusyId("");
                return;
            }
        } else {
            saveGuestWishlist(item);
        }

        await handleRemove(item);
        toast.success("Moved to wishlist");
        setBusyId("");
    };

    if (loadingCart) {
        return (
            <div className="bg-slate-50 py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* cart load hote waqt same layout ke skeleton cards dikhte hain */}
                    <div className="mb-6 h-10 w-56 animate-pulse rounded-xl bg-white" />
                    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                        <div className="space-y-3">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="h-36 animate-pulse rounded-2xl bg-white" />
                            ))}
                        </div>
                        <div className="h-72 animate-pulse rounded-2xl bg-white" />
                    </div>
                </div>
            </div>
        );
    }

    if (!cartItems.length) {
        return (
            <div className="bg-slate-50 py-16">
                <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-slate-700 shadow-sm">
                        <ShoppingCart size={26} />
                    </div>
                    <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">Your cart is empty</h1>
                    <p className="mt-3 text-slate-500">Add products to your cart and they will appear here.</p>
                    <Link href="/products" className="mt-7 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800">
                        Continue shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* header me item count aur clear cart action  */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Cart</p>
                        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Your shopping cart</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm text-slate-500">
                            {cartItems.length} unique item{cartItems.length > 1 ? "s" : ""}, {totalQty} total quantity
                        </p>
                        <button
                            type="button"
                            onClick={handleClearCart}
                            disabled={busyId === "clear"}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-rose-200 hover:text-rose-600 disabled:opacity-60"
                        >
                            {busyId === "clear" ? "Clearing..." : "Clear cart"}
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-3">
                        {cartItems.map((item) => {
                            // card render se pehle price, image, color aur busy state nikal lete hain
                            const productId = getCartProductId(item);
                            const itemKey = getCartItemKey(item);
                            const selectedColor = getCartSelectedColor(item);
                            const price = getPrice(item);
                            const image = buildImageUrl(item.image_path || "/images/products/main_images/", item.image_name);
                            const itemBusy = busyId === String(productId) || busyId === `wish-${productId}`;

                            return (
                                <div key={itemKey} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
                                    <Link href={`/products/${item.slug || ""}`} className="h-28 w-full overflow-hidden rounded-xl bg-slate-100 sm:w-28">
                                        <img src={image} alt={item.name || "Product"} className="h-full w-full object-cover" />
                                    </Link>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-slate-500">{item.brand_id?.name || "iShop"}</p>
                                        <Link href={`/products/${item.slug || ""}`} className="mt-1 block font-semibold text-slate-950 hover:text-slate-700">
                                            {item.name || "Product"}
                                        </Link>
                                        <p className="mt-2 text-sm text-slate-500">{formatPrice(price)} each</p>
                                        {/* selected color available ho to */}
                                        {selectedColor && (
                                            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                                                <span className="h-3.5 w-3.5 rounded-full border border-slate-200" style={{ backgroundColor: selectedColor.color_code || "#e2e8f0" }} />
                                                Color: {selectedColor.name}
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleMoveToWishlist(item)}
                                            disabled={itemBusy}
                                            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-400 hover:text-slate-950 disabled:opacity-60"
                                        >
                                            <Heart size={14} /> Move to wishlist
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                                        <div className="flex h-10 items-center rounded-full border border-slate-200 bg-white">
                                            <button
                                                type="button"
                                                disabled={itemBusy || Number(item.quantity || 1) <= 1}
                                                onClick={() => handleQuantityChange(item, Number(item.quantity || 1) - 1)}
                                                className="grid h-full w-10 place-items-center text-slate-600 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <Minus size={15} />
                                            </button>
                                            <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                            <button
                                                type="button"
                                                disabled={itemBusy}
                                                onClick={() => handleQuantityChange(item, Number(item.quantity || 1) + 1)}
                                                className="grid h-full w-10 place-items-center text-slate-600 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <Plus size={15} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <p className="font-semibold text-slate-950">{formatPrice(price * Number(item.quantity || 1))}</p>
                                            <button
                                                type="button"
                                                disabled={itemBusy}
                                                onClick={() => handleRemove(item)}
                                                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* order summary sticky */}
                    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-20">
                        <h2 className="text-lg font-semibold text-slate-950">Order summary</h2>
                        <div className="mt-5 space-y-3 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span className="font-medium text-slate-950">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Delivery</span>
                                <span className="font-medium text-emerald-700">Free</span>
                            </div>
                            <div className="border-t border-slate-200 pt-3">
                                <div className="flex justify-between text-base font-semibold text-slate-950">
                                    <span>Total</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                            </div>
                        </div>

                        <Link href="/checkout" className="mt-6 block w-full rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-medium text-white hover:bg-slate-800">
                            Checkout
                        </Link>
                        <Link href="/products" className="mt-3 block rounded-full border border-slate-200 px-5 py-3 text-center text-sm font-medium text-slate-700 hover:border-slate-400">
                            Continue shopping
                        </Link>
                    </aside>
                </div>
            </div>
        </div>
    );
}

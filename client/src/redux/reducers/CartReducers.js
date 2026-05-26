import { createSlice } from "@reduxjs/toolkit";

export const CART_STORAGE_KEY = "ishop_guest_cart";
const DEFAULT_IMAGE_PATH = "/images/products/main_images/";

const safeNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
};

const toPlainCart = (cartItems = []) =>
    cartItems.map((item) => JSON.parse(JSON.stringify(item || {})));

export const getCartStorage = () => {
    if (typeof window === "undefined") return [];

    try {
        const cart = localStorage.getItem(CART_STORAGE_KEY);
        const parsed = cart ? JSON.parse(cart) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        localStorage.removeItem(CART_STORAGE_KEY);
        return [];
    }
};

export const saveCart = (cartItems) => {
    if (typeof window !== "undefined") {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(toPlainCart(cartItems)));
    }
};

export const getCartProductId = (item) => {
    if (!item) return undefined;

    return (
        item.product?._id ||
        item.product_id?._id ||
        item.product_id ||
        item._product_id ||
        item._id
    );
};

export const getCartDocumentId = (item) => item?.cart_id || item?.cartId || item?.cart?._id;

export const getCartSelectedColor = (item) => {
    if (!item) return null;

    const color =
        item.selected_color ||
        item.selectedColor ||
        item.cart_color ||
        item.color ||
        (typeof item.color_id === "object" ? item.color_id : null);

    if (!color) return null;

    return {
        _id: color._id || color.color_id || color.id || null,
        color_id: color.color_id || color._id || color.id || null,
        name: color.name || color.color_name || "Selected color",
        color_code: color.color_code || color.code || "#e2e8f0",
    };
};

export const getCartColorId = (item) => {
    if (!item) return "";
    const selected = getCartSelectedColor(item);
    return (
        selected?._id ||
        selected?.color_id ||
        item.selected_color_id ||
        (typeof item.color_id === "string" ? item.color_id : "") ||
        ""
    );
};

export const getCartItemKey = (item) => {
    const productId = getCartProductId(item);
    const colorId = getCartColorId(item);
    const cartId = getCartDocumentId(item);

    if (productId) return `${String(productId)}::${String(colorId || "default")}`;
    return String(cartId || "");
};

export const normalizeCartItem = (item = {}) => {
    const sourceProduct = item.product || (typeof item.product_id === "object" ? item.product_id : null) || item;
    const productId =
        sourceProduct?._id ||
        (typeof item.product_id === "string" ? item.product_id : undefined) ||
        item._product_id ||
        item.productId ||
        item._id;

    const cartId =
        item.cart_id ||
        item.cartId ||
        item.cart?._id ||
        (item.product || typeof item.product_id === "object" ? item._id : undefined);

    const quantity = Math.max(1, safeNumber(item.quantity ?? item.qty, 1));
    const discountedPrice = safeNumber(
        sourceProduct.discounted_price ?? sourceProduct.discount_price ?? sourceProduct.price ?? item.discounted_price ?? item.price,
        0
    );
    const originalPrice = safeNumber(sourceProduct.original_price ?? item.original_price ?? discountedPrice, discountedPrice);
    const selectedColor = getCartSelectedColor({ ...sourceProduct, ...item });
    const colorId = getCartColorId({ ...sourceProduct, ...item, selected_color: selectedColor });

    return {
        ...sourceProduct,
        _id: productId,
        _product_id: productId,
        product_id: productId,
        cart_id: cartId,
        color_id: colorId || null,
        selected_color: selectedColor,
        quantity,
        qty: quantity,
        original_price: originalPrice,
        discounted_price: discountedPrice,
        discount_price: discountedPrice,
        price: discountedPrice,
        subtotal: item.subtotal ?? discountedPrice * quantity,
        image_path: sourceProduct.image_path || item.image_path || DEFAULT_IMAGE_PATH,
    };
};

export const mergeCartItems = (items = []) => {
    const map = new Map();

    items.map(normalizeCartItem).forEach((item) => {
        const id = getCartProductId(item);
        if (!id) return;

        const key = getCartItemKey(item);
        const existing = map.get(key);

        if (existing) {
            const quantity = safeNumber(existing.quantity, 1) + safeNumber(item.quantity, 1);
            map.set(key, {
                ...existing,
                ...item,
                quantity,
                qty: quantity,
                subtotal: safeNumber(item.discounted_price ?? existing.discounted_price, 0) * quantity,
            });
        } else {
            map.set(key, item);
        }
    });

    return Array.from(map.values());
};

const calculateCount = (cartItems = []) => cartItems.filter((item) => getCartProductId(item)).length;

const initialCart = mergeCartItems(getCartStorage());

const findIndexByPayload = (cartItems, payload) => {
    const isObjectPayload = typeof payload === "object" && payload !== null;
    const id = isObjectPayload ? getCartProductId(payload) : payload;
    const colorId = isObjectPayload ? getCartColorId(payload) : undefined;
    const cartId = isObjectPayload ? getCartDocumentId(payload) : payload;

    return cartItems.findIndex((item) => {
        const cartMatch = cartId && getCartDocumentId(item) && String(getCartDocumentId(item)) === String(cartId);
        if (cartMatch) return true;

        const productMatch = id && String(getCartProductId(item)) === String(id);
        if (!productMatch) return false;

        if (isObjectPayload && colorId !== undefined) {
            return String(getCartColorId(item) || "") === String(colorId || "");
        }

        return true;
    });
};

const cartSlice = createSlice({
    name: "cart",

    initialState: {
        cartItems: initialCart,
        cartCount: calculateCount(initialCart),
    },

    reducers: {
        addToCart: (state, action) => {
            const incoming = normalizeCartItem(action.payload);
            const qty = Math.max(1, safeNumber(action.payload?.quantity ?? action.payload?.qty, 1));
            const incomingId = getCartProductId(incoming);

            if (!incomingId) return;

            const incomingKey = getCartItemKey(incoming);
            const index = state.cartItems.findIndex((item) => getCartItemKey(item) === incomingKey);

            if (index > -1) {
                const existing = state.cartItems[index];
                const nextQty = safeNumber(existing.quantity, 1) + qty;
                state.cartItems[index] = {
                    ...existing,
                    ...incoming,
                    quantity: nextQty,
                    qty: nextQty,
                    subtotal: safeNumber(incoming.discounted_price ?? existing.discounted_price, 0) * nextQty,
                };
            } else {
                state.cartItems.push({
                    ...incoming,
                    quantity: qty,
                    qty,
                    subtotal: safeNumber(incoming.discounted_price, 0) * qty,
                });
            }

            state.cartItems = mergeCartItems(state.cartItems);
            state.cartCount = calculateCount(state.cartItems);
            saveCart(state.cartItems);
        },

        syncCart: (state, action) => {
            const cart = Array.isArray(action.payload) ? action.payload : [];
            state.cartItems = mergeCartItems(cart);
            state.cartCount = calculateCount(state.cartItems);
            saveCart(state.cartItems);
        },

        removeFromCart: (state, action) => {
            const index = findIndexByPayload(state.cartItems, action.payload);
            if (index > -1) state.cartItems.splice(index, 1);
            state.cartCount = calculateCount(state.cartItems);
            saveCart(state.cartItems);
        },

        increaseQuantity: (state, action) => {
            const index = findIndexByPayload(state.cartItems, action.payload);

            if (index > -1) {
                const item = state.cartItems[index];
                const quantity = safeNumber(item.quantity, 1) + 1;
                state.cartItems[index] = {
                    ...item,
                    quantity,
                    qty: quantity,
                    subtotal: safeNumber(item.discounted_price, 0) * quantity,
                };
            }

            state.cartCount = calculateCount(state.cartItems);
            saveCart(state.cartItems);
        },

        decreaseQuantity: (state, action) => {
            const index = findIndexByPayload(state.cartItems, action.payload);

            if (index > -1) {
                const item = state.cartItems[index];
                const quantity = Math.max(1, safeNumber(item.quantity, 1) - 1);
                state.cartItems[index] = {
                    ...item,
                    quantity,
                    qty: quantity,
                    subtotal: safeNumber(item.discounted_price, 0) * quantity,
                };
            }

            state.cartCount = calculateCount(state.cartItems);
            saveCart(state.cartItems);
        },

        setCartItemQuantity: (state, action) => {
            const index = findIndexByPayload(state.cartItems, action.payload || {});
            const qty = action.payload?.qty ?? action.payload?.quantity;

            if (index > -1) {
                const item = state.cartItems[index];
                const quantity = Math.max(1, safeNumber(qty, 1));
                state.cartItems[index] = {
                    ...item,
                    quantity,
                    qty: quantity,
                    subtotal: safeNumber(item.discounted_price, 0) * quantity,
                };
            }

            state.cartCount = calculateCount(state.cartItems);
            saveCart(state.cartItems);
        },

        clearCart: (state) => {
            state.cartItems = [];
            state.cartCount = 0;
            saveCart([]);
        },

        restoreCart: (state) => {
            const cart = mergeCartItems(getCartStorage());
            state.cartItems = cart;
            state.cartCount = calculateCount(cart);
        },
    },
});

export const {
    addToCart,
    syncCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    setCartItemQuantity,
    clearCart,
    restoreCart,
} = cartSlice.actions;

export default cartSlice.reducer;

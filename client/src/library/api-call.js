import { apiClient, getAuthHeader, getUserAuthHeader } from "./helper";

// =========================
// CATEGORY
// =========================
export const getCategory = async (query_object = null) => {
    try {
        const searchParams = new URLSearchParams();

        if (query_object?.id) searchParams.append("id", query_object.id);
        if (query_object?.slug) searchParams.append("slug", query_object.slug);
        if (query_object?.status !== undefined) searchParams.append("status", query_object.status);
        if (query_object?.on_home !== undefined) searchParams.append("on_home", query_object.on_home);
        if (query_object?.is_featured !== undefined) searchParams.append("is_featured", query_object.is_featured);
        if (query_object?.is_top !== undefined) searchParams.append("is_top", query_object.is_top);
        if (query_object?.search) searchParams.append("search", query_object.search);

        const apiUrl = searchParams.toString() ? `/category?${searchParams.toString()}` : "/category";
        const response = await apiClient.get(apiUrl);

        if (response.data.flag == 1) {
            return {
                categories: response.data.categories || [],
                image_path: response.data.image_path || "",
            };
        }

        return { categories: [], image_path: "" };
    } catch (error) {
        return { categories: [], image_path: "" };
    }
};

// =========================
// BRAND
// =========================
export const getBrand = async (query_object = null) => {
    try {
        const searchParams = new URLSearchParams();

        if (query_object?.id) searchParams.append("id", query_object.id);
        if (query_object?.slug) searchParams.append("slug", query_object.slug);
        if (query_object?.status !== undefined) searchParams.append("status", query_object.status);
        if (query_object?.category_id) searchParams.append("category_id", query_object.category_id);
        if (query_object?.is_featured !== undefined) searchParams.append("is_featured", query_object.is_featured);
        if (query_object?.search) searchParams.append("search", query_object.search);

        const apiUrl = searchParams.toString() ? `/brand?${searchParams.toString()}` : "/brand";
        const response = await apiClient.get(apiUrl);

        if (response.data.flag == 1) {
            return {
                brands: response.data.brands || [],
                image_path: response.data.image_path || "",
            };
        }

        return { brands: [], image_path: "" };
    } catch (error) {
        return { brands: [], image_path: "" };
    }
};

// =========================
// COLORS
// =========================
export const getColors = async (query_object = null) => {
    try {
        const searchParams = new URLSearchParams();

        if (query_object?.id) searchParams.append("id", query_object.id);
        if (query_object?.slug) searchParams.append("slug", query_object.slug);
        if (query_object?.status !== undefined) searchParams.append("status", query_object.status);

        const apiUrl = searchParams.toString() ? `/color?${searchParams.toString()}` : "/color";
        const response = await apiClient.get(apiUrl);

        if (response.data.flag == 1) {
            return { colors: response.data.colors || [] };
        }

        return { colors: [] };
    } catch (error) {
        return { colors: [] };
    }
};

// =========================
// PRODUCT
// =========================
export const getProduct = async (query_object = {}) => {
    try {
        const params = { ...query_object };

        const normalizeMulti = (key) => {
            if (!params[key]) return;

            if (Array.isArray(params[key])) {
                params[key] = params[key]
                    .map((item) => (typeof item === "object" ? item.value : item))
                    .filter(Boolean)
                    .join(",");
            }
        };

        ["brand_id", "category_id", "color_id"].forEach(normalizeMulti);

        Object.keys(params).forEach((key) => {
            if (
                params[key] === "" ||
                params[key] === null ||
                params[key] === undefined ||
                (Array.isArray(params[key]) && params[key].length === 0)
            ) {
                delete params[key];
            }
        });

        const query = new URLSearchParams(params).toString();
        const apiUrl = query ? `/product?${query}` : "/product";
        const response = await apiClient.get(apiUrl);

        if (response.data.flag == 1) {
            return {
                products: response.data.products || [],
                total: response.data.total || 0,
                page: response.data.page || 1,
                limit: response.data.limit || 12,
                image_path: response.data.image_path || "",
                other_image_path: response.data.other_image_path || "",
            };
        }

        return {
            products: [],
            total: 0,
            page: 1,
            limit: 12,
            image_path: "",
            other_image_path: "",
        };
    } catch (error) {
        console.log(error);
        return {
            products: [],
            total: 0,
            page: 1,
            limit: 12,
            image_path: "",
            other_image_path: "",
        };
    }
};

// =========================
// ADMIN APIs
// =========================
export const getAdmins = async () => {
    try {
        const response = await apiClient.get("/admin/all", getAuthHeader());

        if (response.data.flag === 1) {
            return { admins: response.data.admins || [] };
        }

        return { admins: [] };
    } catch (error) {
        return { admins: [] };
    }
};

export const getOrders = async () => {
    try {
        const response = await apiClient.get("/order/admin/all", getAuthHeader());

        if (response.data.flag == 1) {
            return { orders: response.data.orders || [] };
        }

        return { orders: [] };
    } catch (error) {
        return { orders: [] };
    }
};

export const userLoginApi = async (data) => {
    return await apiClient.post("/user/login", data);
};

export const userRegisterApi = async (data) => {
    return await apiClient.post("/user/register", data);
};

// =========================
// CART APIs
// =========================
export const addToCartApi = async (data) => {
    try {
        const response = await apiClient.post("/cart/add", data, getUserAuthHeader());
        return response.data;
    } catch (error) {
        return { flag: 0, msg: "something went wrong" };
    }
};

export const getCartItems = async () => {
    try {
        const response = await apiClient.get("/cart", getUserAuthHeader());
        return response.data;
    } catch (error) {
        return { flag: 0, cart: [] };
    }
};

export const updateCartQty = async (cart_id, qty) => {
    try {
        const response = await apiClient.patch(`/cart/update/${cart_id}`, { qty }, getUserAuthHeader());
        return response.data;
    } catch (error) {
        return { flag: 0, msg: "could not update cart" };
    }
};

export const deleteCartItem = async (cart_id) => {
    try {
        const response = await apiClient.delete(`/cart/delete/${cart_id}`, getUserAuthHeader());
        return response.data;
    } catch (error) {
        return { flag: 0, msg: "could not remove cart item" };
    }
};

export const clearCartApi = async () => {
    try {
        const response = await apiClient.delete("/cart/clear", getUserAuthHeader());
        return response.data;
    } catch (error) {
        return { flag: 0, msg: "could not clear cart", cart: [] };
    }
};

// =========================
// ADDRESS APIs
// =========================
export const getAddresses = async () => {
    try {
        const response = await apiClient.get("/address", getUserAuthHeader());
        return response.data;
    } catch (error) {
        return { flag: 0, addresses: [] };
    }
};

export const addAddress = async (data) => {
    try {
        const response = await apiClient.post("/address/add", data, getUserAuthHeader());
        return response.data;
    } catch (error) {
        return { flag: 0, msg: "could not save address" };
    }
};

export const updateAddress = async (address_id, data) => {
    try {
        const response = await apiClient.patch(`/address/update/${address_id}`, data, getUserAuthHeader());
        return response.data;
    } catch (error) {
        return { flag: 0, msg: "could not update address" };
    }
};

export const deleteAddress = async (address_id) => {
    try {
        const response = await apiClient.delete(`/address/delete/${address_id}`, getUserAuthHeader());
        return response.data;
    } catch (error) {
        return { flag: 0, msg: "could not delete address" };
    }
};

// =========================
// ORDER APIs
// =========================
export const createOrder = async (data) => {
    try {
        const response = await apiClient.post("/order/create", data, getUserAuthHeader());
        return response.data;
    } catch (error) {
        return { flag: 0, msg: "could not place order" };
    }
};

export const getMyOrders = async () => {
    try {
        const response = await apiClient.get("/order/my-orders", getUserAuthHeader());
        return response.data;
    } catch (error) {
        return { flag: 0, orders: [] };
    }
};

export const cancelOrder = async (order_id) => {
    try {
        const response = await apiClient.patch(`/order/cancel/${order_id}`, {}, getUserAuthHeader());
        return response.data;
    } catch (error) {
        return { flag: 0, msg: "could not cancel order" };
    }
};

// =========================
// PAYMENT APIs
// =========================
export const createPaymentOrder = async (data = {}) => {
    try {
        const response = await apiClient.post("/payment/create-order", data, getUserAuthHeader());
        return response.data;
    } catch (error) {
        return { flag: 0, msg: "could not create payment" };
    }
};

export const verifyPayment = async (data) => {
    try {
        const response = await apiClient.post("/payment/verify", data, getUserAuthHeader());
        return response.data;
    } catch (error) {
        return { flag: 0, msg: "could not verify payment" };
    }
};

export const cancelPayment = async (data = {}) => {
    try {
        const response = await apiClient.post("/payment/cancel", data, getUserAuthHeader());
        return response.data;
    } catch (error) {
        return { flag: 0, msg: "could not cancel payment" };
    }
};


// =========================
// WISHLIST APIs
// =========================
export const addToWishlist = async (product_id) => {
    try {
        const response = await apiClient.post("/wishlist/add", { product_id }, getUserAuthHeader());
        return response.data;
    } catch (error) {
        return { flag: 0, msg: "could not add to wishlist" };
    }
};

export const getWishlist = async () => {
    try {
        const response = await apiClient.get("/wishlist", getUserAuthHeader());
        return response.data;
    } catch (error) {
        return { flag: 0, wishlist: [] };
    }
};

export const deleteWishlistItem = async (wishlist_id) => {
    try {
        const response = await apiClient.delete(`/wishlist/delete/${wishlist_id}`, getUserAuthHeader());
        return response.data;
    } catch (error) {
        return { flag: 0, msg: "could not remove wishlist item" };
    }
};

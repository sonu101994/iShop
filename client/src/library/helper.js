import axios from "axios";

// default api request handler created with base url
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// convert title in Slug format
const titleToSlug = (title = "") => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
};

const getAssetBaseUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

    return apiUrl
        .replace(/\/api\/?$/, "")
        .replace(/\/$/, "");
};

const buildImageUrl = (imagePath = "", imageName = "", fallback = "/placeholder.png") => {
    if (!imageName) return fallback;

    if (/^https?:\/\//i.test(imageName)) {
        return imageName;
    }

    const baseUrl = getAssetBaseUrl();
    const cleanPath = imagePath
        ? `/${String(imagePath).replace(/^\/+|\/+$/g, "")}`
        : "";

    return `${baseUrl}${cleanPath}/${imageName}`.replace(/([^:]\/)\/+/g, "$1");
};

// admin
export const getAuthHeader = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// user
export const getUserAuthHeader = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("user_token") : "";

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export { apiClient, titleToSlug, buildImageUrl, getAssetBaseUrl };

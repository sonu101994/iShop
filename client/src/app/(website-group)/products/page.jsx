"use client";

import { useEffect, useState } from "react";
import { getProduct, getCategory, getBrand, getColors } from "@/library/api-call";
import ProductSearch from "@/components/website/ProductSearch";
import ProductFilters from "@/components/website/ProductFilters";
import ProductGrid from "@/components/website/ProductGrid";
import ProductPagination from "@/components/website/ProductPagination";

// default filter values
const initialFilters = {
    search: "",
    category_id: [],
    brand_id: [],
    color_id: [],
    min_price: "",
    max_price: "",
    sort: "newest",
};

export default function ProductsPage() {
    // main page data
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [colors, setColors] = useState([]);
    const [imagePath, setImagePath] = useState("");
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [mobileFilters, setMobileFilters] = useState(false);
    const [filters, setFilters] = useState(initialFilters);
    const [urlParams, setUrlParams] = useState(null);

    useEffect(() => {
        // load filter options first
        loadSidebar();
        setUrlParams(new URLSearchParams(window.location.search));
    }, []);

    useEffect(() => {
        // apply filters from url
        applyUrlFilters();
    }, [categories, brands, colors, urlParams]);

    useEffect(() => {
        // reload products on filter change
        loadProducts();
    }, [filters, page]);

    function getSelectedOptions(items = [], ids = []) {
        // convert url ids into select options
        const selectedIds = String(ids || "")
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean);

        return items
            .filter((item) => selectedIds.includes(String(item._id)))
            .map((item) => ({
                value: item._id,
                label: item.name,
                color: item.color_code,
            }));
    }

    function applyUrlFilters() {
        // wait until filter data is ready
        if (!categories.length && !brands.length && !colors.length) return;
        if (!urlParams) return;

        const categoryId = urlParams.get("category_id") || "";
        const brandId = urlParams.get("brand_id") || "";
        const colorId = urlParams.get("color_id") || "";
        const search = urlParams.get("search") || "";
        const sort = urlParams.get("sort") || "newest";
        const minPrice = urlParams.get("min_price") || "";
        const maxPrice = urlParams.get("max_price") || "";

        // update filters only if url has filters
        const hasUrlFilter = categoryId || brandId || colorId || search || sort !== "newest" || minPrice || maxPrice;

        if (!hasUrlFilter) return;

        setPage(1);
        setFilters({
            search,
            category_id: getSelectedOptions(categories, categoryId),
            brand_id: getSelectedOptions(brands, brandId),
            color_id: getSelectedOptions(colors, colorId),
            min_price: minPrice,
            max_price: maxPrice,
            sort,
        });
    }

    async function loadSidebar() {
        // load sidebar filter data
        const [categoryData, brandData, colorData] = await Promise.all([
            getCategory({ status: true }),
            getBrand({ status: true }),
            getColors({ status: true }),
        ]);

        setCategories(categoryData.categories || []);
        setBrands(brandData.brands || []);
        setColors(colorData.colors || []);
    }

    async function loadProducts() {
        // fetch products with current filters
        setLoading(true);

        try {
            const response = await getProduct({
                ...filters,
                status: true,
                page,
                limit: 12,
            });

            setProducts(response.products || []);
            setImagePath(response.image_path || "");
            setTotal(response.total || 0);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-slate-50">
            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <p className="text-sm font-medium text-slate-500">Shop products</p>
                    <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                                Find what you need
                            </h1>
                            <p className="mt-2 max-w-2xl text-slate-600">
                                Use search, side filters and sorting to browse products
                            </p>
                        </div>
                        <p className="text-sm text-slate-500">
                            <span className="font-semibold text-slate-950">{total}</span> products found
                        </p>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* search and mobile filter button */}
                <ProductSearch
                    filters={filters}
                    setFilters={setFilters}
                    setPage={setPage}
                    total={total}
                    openFilters={() => setMobileFilters(true)}
                />

                <div className="mt-6 grid gap-6 lg:grid-cols-[270px_1fr]">
                    {/* desktop filter sidebar */}
                    <div className="hidden lg:block">
                        <ProductFilters
                            categories={categories}
                            brands={brands}
                            colors={colors}
                            filters={filters}
                            setFilters={setFilters}
                            setPage={setPage}
                        />
                    </div>

                    <div>
                        {/* product list and pagination */}
                        <ProductGrid products={products} imagePath={imagePath} loading={loading} />
                        <ProductPagination page={page} setPage={setPage} total={total} limit={12} />
                    </div>
                </div>
            </div>

            {/* mobile filter drawer */}
            {mobileFilters && (
                <div className="fixed inset-0 z-[70] bg-slate-950/40 p-3 lg:hidden">
                    <div className="ml-auto h-full max-w-sm overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <ProductFilters
                            categories={categories}
                            brands={brands}
                            colors={colors}
                            filters={filters}
                            setFilters={setFilters}
                            setPage={setPage}
                            onClose={() => setMobileFilters(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
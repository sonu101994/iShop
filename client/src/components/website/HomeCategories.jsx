"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MonitorSmartphone } from "lucide-react";
import { getCategory, getProduct } from "@/library/api-call";
import { buildImageUrl } from "@/library/helper";

export default function HomeCategories() {
    // category cards ke saath image path aur loading state section ke andar manage hoti hai
    const [categories, setCategories] = useState([]);
    const [imagePath, setImagePath] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // homepage categories on first render
        loadCategories();
    }, []);

    async function loadCategories() {
        setLoading(true);

        try {
            // pehle on-home categories lete hain, fallback ke liye all active categories bhi lete hain
            const homeData = await getCategory({ status: true, on_home: true });
            const activeData = await getCategory({ status: true });

            // duplicate categories avoid 
            const merged = [];
            const usedIds = new Set();
            const addCategory = (category) => {
                if (!category?._id || usedIds.has(category._id)) return;
                usedIds.add(category._id);
                merged.push(category);
            };

            (homeData.categories || []).forEach(addCategory);
            (activeData.categories || []).forEach(addCategory);

            // homepage layout clean=>>usin g slice for only 4 cat
            const visibleCategories = merged.slice(0, 4);
            const categoriesWithCounts = await Promise.all(
                visibleCategories.map(async (category) => {
                    const productData = await getProduct({ status: true, category_id: category._id, limit: 1 });
                    return {
                        ...category,
                        product_count: productData.total || 0,
                    };
                })
            );

            setCategories(categoriesWithCounts);
            setImagePath(activeData.image_path || homeData.image_path || "");
        } catch {
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="bg-white py-10 sm:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Shop by category</p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                            Browse product category
                        </h2>
                    </div>
                    <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950">
                        Explore all products
                        <ArrowRight size={16} />
                    </Link>
                </div>

                {/* if  loading*/}
                {loading ? (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="h-40 animate-pulse rounded-2xl bg-slate-100 sm:h-44" />
                        ))}
                    </div>
                ) : categories.length ? (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                        {categories.map((category) => (
                            <Link
                                key={category._id}
                                href={`/products?category_id=${category._id}`}
                                className="group rounded-2xl border border-slate-200 bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-md sm:p-4"
                            >
                                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                                    <img
                                        src={buildImageUrl(imagePath, category.image_name)}
                                        alt={category.name}
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <div className="mt-3 flex items-start justify-between gap-2 sm:mt-4">
                                    <div className="min-w-0">
                                        <h3 className="truncate text-sm font-semibold text-slate-950 sm:text-base">{category.name}</h3>
                                        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                            {category.product_count} {category.product_count === 1 ? "product" : "products"}
                                        </p>
                                    </div>
                                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700 transition group-hover:bg-slate-950 group-hover:text-white sm:h-9 sm:w-9">
                                        <ArrowRight size={15} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-slate-700">
                            <MonitorSmartphone size={22} />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-950">No active categories found</h3>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                            Add active categories from the admin panel. Customers can still browse all active products from product page.
                        </p>
                        <Link href="/products" className="mt-4 inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white">
                            Explore all products
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}

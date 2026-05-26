"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { getProduct } from "@/library/api-call";
import ProductCard from "./ProductCard";

export default function TopProducts() {
    // admin marked top products ko homepage ke alag section me show karte hain
    const [products, setProducts] = useState([]);
    const [imagePath, setImagePath] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // section mount ==>>top products load
        loadProducts();
    }, []);

    async function loadProducts() {
        setLoading(true);

        try {
            // fetching top products
            const top = await getProduct({ status: true, is_top: true, limit: 4, sort: "popular" });
            setProducts(top.products || []);
            setImagePath(top.image_path || "");
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="bg-white py-12 sm:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 ring-1 ring-slate-200">
                            <TrendingUp size={14} />
                            Top picks
                        </div>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                            Top products
                        </h2>
                       
                    </div>
                    <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950">
                        Explore all products
                        <ArrowRight size={16} />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="h-[390px] animate-pulse rounded-2xl bg-slate-100" />
                        ))}
                    </div>
                ) : products.length ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {products.slice(0, 4).map((product) => (
                            <ProductCard key={product._id} product={product} imagePath={imagePath} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                        No top products selected yet. Mark products as Top from the admin product settings.
                    </div>
                )}
            </div>
        </section>
    );
}

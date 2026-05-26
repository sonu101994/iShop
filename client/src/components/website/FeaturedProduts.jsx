"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { getProduct } from "@/library/api-call";
import ProductCard from "./ProductCard";

export default function FeaturedProducts() {
    // homepage par sirf admin marked featured products show karne ke liye local list rakhte hain
    const [products, setProducts] = useState([]);
    const [imagePath, setImagePath] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // section mount==>> products load 
        loadProducts();
    }, []);

    async function loadProducts() {
        setLoading(true);

        try {
            // api ==>active aur featured marked products extracting
            const featured = await getProduct({ status: true, is_featured: true, limit: 4 });
            setProducts(featured.products || []);
            setImagePath(featured.image_path || "");
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="bg-slate-50 py-12 sm:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 ring-1 ring-slate-200">
                            <Star size={14} />
                            Featured picks
                        </div>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                            Featured products
                        </h2>
                    </div>
                    <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950">
                        Explore all products
                        <ArrowRight size={16} />
                    </Link>
                </div>

                {/* loading skeleton, product cards aur empty admin message */}
                {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="h-[390px] animate-pulse rounded-2xl bg-white" />
                        ))}
                    </div>
                ) : products.length ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* card component add to cart logic  */}
                        {products.slice(0, 4).map((product) => (
                            <ProductCard key={product._id} product={product} imagePath={imagePath} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                        No featured products selected yet. Mark products as Featured from the admin product settings.
                    </div>
                )}
            </div>
        </section>
    );
}

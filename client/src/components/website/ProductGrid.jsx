"use client";

import ProductCard from "./ProductCard";

export default function ProductGrid({ products, imagePath, loading }) {
    if (loading) {
        // loading skeleton
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="h-[390px] animate-pulse rounded-2xl bg-white" />
                ))}
            </div>
        );
    }

    if (!products?.length) {

        return (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-2xl">🔎</div>
                <h3 className="text-xl font-semibold text-slate-950">No products found</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Try changing search or filters.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
                <ProductCard key={product._id} product={product} imagePath={imagePath} />
            ))}
        </div>
    );
}

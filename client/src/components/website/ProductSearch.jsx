"use client";

import { Search, SlidersHorizontal } from "lucide-react";

export default function ProductSearch({ filters, setFilters, setPage, total, openFilters }) {
    const updateValue = (key, value) => {
        // search ya sort change ==>then first page
        setPage(1);
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                {/* search input filters.search ko live update */}
                <div className="flex flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5 focus-within:border-slate-400">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={filters.search}
                        onChange={(event) => updateValue("search", event.target.value)}
                        className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center gap-3">
                    {/* mobile screen par sidebar filters drawer */}
                    <button
                        type="button"
                        onClick={openFilters}
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700 lg:hidden"
                    >
                        <SlidersHorizontal size={16} />
                        Filters
                    </button>

                    <select
                        value={filters.sort}
                        onChange={(event) => updateValue("sort", event.target.value)}
                        className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
                    >
                        <option value="newest">Newest first</option>
                        <option value="popular">Popular</option>
                        <option value="rating">Top rated</option>
                        <option value="discount">Biggest discount</option>
                        <option value="price_low">Price: low to high</option>
                        <option value="price_high">Price: high to low</option>
                        <option value="name_asc">Name A-Z</option>
                    </select>
                </div>
            </div>

            <p className="mt-2 px-1 text-xs text-slate-500">{total || 0} matching products</p>
        </div>
    );
}

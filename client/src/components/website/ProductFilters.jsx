"use client";

import Select from "react-select";
import { RotateCcw, X } from "lucide-react";

// react-select controls styles
const selectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: 42,
        borderRadius: 12,
        borderColor: state.isFocused ? "#94a3b8" : "#e2e8f0",
        boxShadow: "none",
        fontSize: 14,
        ":hover": {
            borderColor: "#94a3b8",
        },
    }),
    multiValue: (base) => ({
        ...base,
        borderRadius: 999,
        backgroundColor: "#f1f5f9",
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: "#0f172a",
        fontWeight: 500,
    }),
    menu: (base) => ({
        ...base,
        borderRadius: 12,
        overflow: "hidden",
        zIndex: 60,
    }),
};

export default function ProductFilters({
    categories,
    brands,
    colors,
    filters,
    setFilters,
    setPage,
    onClose,
}) {
    const updateFilter = (key, value) => {
        // restoring filter on page one
        setPage(1);
        setFilters((prev) => ({ ...prev, [key]: value || [] }));
    };

    const updatePrice = (key, value) => {
        setPage(1);
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    // category==>>selected==>>brands
    const selectedCategoryIds = new Set((filters.category_id || []).map((item) => item.value));
    const filteredBrands = selectedCategoryIds.size
        ? brands.filter((brand) =>
              (brand.category_ids || []).some((category) => selectedCategoryIds.has(category?._id || category))
          )
        : brands;

    // single value extracting to show in select-react
    const categoryOptions = categories.map((item) => ({ value: item._id, label: item.name }));
    const brandOptions = filteredBrands.map((item) => ({ value: item._id, label: item.name }));
    const colorOptions = colors.map((item) => ({ value: item._id, label: item.name, color: item.color_code }));

    const activeFilters =
    // active filters
        (filters.category_id?.length || 0) +
        (filters.brand_id?.length || 0) +
        (filters.color_id?.length || 0) +
        (filters.min_price ? 1 : 0) +
        (filters.max_price ? 1 : 0);

    const clearFilters = () => {
        // clear filters search, multi-selects, price aur sorting 
        setPage(1);
        setFilters({
            search: "",
            category_id: [],
            brand_id: [],
            color_id: [],
            min_price: "",
            max_price: "",
            sort: "newest",
        });
    };

    return (
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-20 lg:h-fit">
            <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold text-slate-950">Filters</h2>
                    <p className="mt-1 text-sm text-slate-500">Refine your product list</p>
                </div>

                <div className="flex items-center gap-2">
                    {activeFilters > 0 && (
                        <span className="rounded-full bg-slate-950 px-2 py-1 text-xs font-medium text-white">{activeFilters}</span>
                    )}
                    {onClose && (
                        <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full border border-slate-200">
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-5">
                {/* category filter multiple categories select */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-800">Category</label>
                    <Select
                        isMulti
                        options={categoryOptions}
                        value={filters.category_id}
                        closeMenuOnSelect={false}
                        placeholder="Choose category"
                        onChange={(value) => updateFilter("category_id", value)}
                        styles={selectStyles}
                    />
                </div>

                {/* brand options selected category ke according filtered  */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-800">Brand</label>
                    <Select
                        isMulti
                        options={brandOptions}
                        value={filters.brand_id}
                        closeMenuOnSelect={false}
                        placeholder="Choose brand"
                        onChange={(value) => updateFilter("brand_id", value)}
                        styles={selectStyles}
                    />
                </div>

                {/* color filter */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-800">Color</label>
                    <Select
                        isMulti
                        options={colorOptions}
                        value={filters.color_id}
                        closeMenuOnSelect={false}
                        placeholder="Choose color"
                        onChange={(value) => updateFilter("color_id", value)}
                        formatOptionLabel={(option) => (
                            <div className="flex items-center gap-2">
                                <span className="h-4 w-4 rounded-full border border-slate-200" style={{ backgroundColor: option.color || "#e2e8f0" }} />
                                <span>{option.label}</span>
                            </div>
                        )}
                        styles={selectStyles}
                    />
                </div>

                {/* min aur max price*/}
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-800">Price</label>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            min="0"
                            value={filters.min_price}
                            onChange={(event) => updatePrice("min_price", event.target.value)}
                            placeholder="Min"
                            className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                        />
                        <input
                            type="number"
                            min="0"
                            value={filters.max_price}
                            onChange={(event) => updatePrice("max_price", event.target.value)}
                            placeholder="Max"
                            className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                        />
                    </div>
                </div>

                {/* reset button */}
                <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-400"
                >
                    <RotateCcw size={15} />
                    Clear filters
                </button>
            </div>
        </aside>
    );
}

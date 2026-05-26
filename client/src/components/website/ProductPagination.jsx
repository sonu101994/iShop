"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductPagination({ page, setPage, total, limit }) {
    // total products aur limit se total pages 
    const totalPages = Math.ceil(total / limit);

    // single page result ho to pagination controls hide
    if (!totalPages || totalPages <= 1) return null;

    // first, last aur current 
    const visiblePages = Array.from({ length: totalPages })
        .map((_, index) => index + 1)
        .filter((pageNumber) => pageNumber === 1 || pageNumber === totalPages || Math.abs(pageNumber - page) <= 1);

    return (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {/* previous button first page par disabled rehta hai */}
            <button
                type="button"
                onClick={() => page > 1 && setPage(page - 1)}
                disabled={page === 1}
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronLeft size={17} />
            </button>

            {visiblePages.map((pageNumber, index) => {
                const previousPage = visiblePages[index - 1];
                const showDots = previousPage && pageNumber - previousPage > 1;

                return (
                    <div key={pageNumber} className="flex items-center gap-2">
                        {showDots && <span className="text-slate-400">...</span>}
                        <button
                            type="button"
                            onClick={() => setPage(pageNumber)}
                            className={`h-10 min-w-10 rounded-full border px-3 text-sm font-medium ${
                                page === pageNumber
                                    ? "border-slate-950 bg-slate-950 text-white"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                            }`}
                        >
                            {pageNumber}
                        </button>
                    </div>
                );
            })}

            {/* next button last page par disabled  */}
            <button
                type="button"
                onClick={() => page < totalPages && setPage(page + 1)}
                disabled={page === totalPages}
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronRight size={17} />
            </button>
        </div>
    );
}

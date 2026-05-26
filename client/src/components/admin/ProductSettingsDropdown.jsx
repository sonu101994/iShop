"use client";

import { apiClient, getAuthHeader } from "@/library/helper";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const productFlags = [
    { flag: "1", key: "status", label: "Status", trueText: "Active", falseText: "Inactive" },
    { flag: "2", key: "on_home", label: "Home", trueText: "On Home", falseText: "Not Home" },
    { flag: "3", key: "is_featured", label: "Featured", trueText: "Featured", falseText: "Not Featured" },
    { flag: "4", key: "is_top", label: "Top", trueText: "Top", falseText: "Not Top" },
    { flag: "5", key: "is_hot", label: "Hot", trueText: "Hot", falseText: "Not Hot" },
    { flag: "6", key: "is_best", label: "Best", trueText: "Best", falseText: "Not Best" },
];

export default function ProductSettingsDropdown({ product, base_url }) {
    const wrapperRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [state, setState] = useState({
        status: !!product.status,
        on_home: !!product.on_home,
        is_featured: !!product.is_featured,
        is_top: !!product.is_top,
        is_hot: !!product.is_hot,
        is_best: !!product.is_best,
    });
    const [updatingKey, setUpdatingKey] = useState("");

    useEffect(() => {
        const closeOnOutside = (event) => {
            if (!wrapperRef.current?.contains(event.target)) setOpen(false);
        };
        document.addEventListener("mousedown", closeOnOutside);
        return () => document.removeEventListener("mousedown", closeOnOutside);
    }, []);

    const toggleSetting = async (selected) => {
        if (!selected || updatingKey) return;

        try {
            setUpdatingKey(selected.key);
            const response = await apiClient.patch(`${base_url}/${product._id}/${selected.flag}`, {}, getAuthHeader());

            if (response.data.flag == 1) {
                setState((prev) => ({ ...prev, [selected.key]: !prev[selected.key] }));
                toast.success(response.data.msg || `${selected.label} updated`);
            } else {
                toast.warning(response.data.msg || "Could not update setting");
            }
        } catch (error) {
            console.log("error", error.message);
            toast.error("Something went wrong!");
        } finally {
            setUpdatingKey("");
        }
    };

    const activeCount = productFlags.filter((item) => state[item.key]).length;

    return (
        <div ref={wrapperRef} className="relative min-w-[210px]">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
                <span>Manage settings</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{activeCount} active</span>
            </button>

            {open && (
                <div className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    {productFlags.map((item) => {
                        const isOn = state[item.key];
                        const isUpdating = updatingKey === item.key;
                        return (
                            <button
                                key={item.flag}
                                type="button"
                                disabled={!!updatingKey}
                                onClick={() => toggleSetting(item)}
                                className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                <span>
                                    <span className="block font-semibold text-slate-800">{item.label}</span>
                                    <span className="text-xs text-slate-500">{isUpdating ? "Updating..." : isOn ? item.trueText : item.falseText}</span>
                                </span>
                                <span className={`h-6 w-11 rounded-full p-1 transition ${isOn ? "bg-slate-900" : "bg-slate-200"}`}>
                                    <span className={`block h-4 w-4 rounded-full bg-white transition ${isOn ? "translate-x-5" : "translate-x-0"}`} />
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="mt-2 flex flex-wrap gap-1.5">
                {productFlags.slice(0, 4).map((item) => (
                    <span
                        key={item.flag}
                        className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${
                            state[item.key] ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-500"
                        }`}
                    >
                        {item.label}: {state[item.key] ? "Yes" : "No"}
                    </span>
                ))}
            </div>
        </div>
    );
}

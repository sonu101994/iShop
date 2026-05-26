"use client";
import { apiClient, getAuthHeader } from "@/library/helper";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function ToggleBtn({
    id,
    current,
    base_url,
    flag,
    trueText,
    falseText
}) {
    const [currentValue, setCurrentValue] = useState(current);
    const [updating, setUpdating] = useState(false);

    // sync latest value
    useEffect(() => {
        setCurrentValue(current);
    }, [current]);

    // toggle status handler
    const toggleHandler = async () => {
        if (updating) return;
        try {
            setUpdating(true);
            const response = await apiClient.patch(
                flag ? `${base_url}/${id}/${flag}` : `${base_url}/${id}`,
                {},
                getAuthHeader()
            );

            if (response.data.flag == 1) {
                toast.success(response.data.msg);
                setCurrentValue(!currentValue);
            } else {
                toast.warning(response.data.msg);
            }
        } catch (error) {
            console.log("error", error.message);
            toast.error("Something went wrong!");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <button
            type="button"
            onClick={toggleHandler}
            disabled={updating}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                currentValue
                    ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"
            }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${currentValue ? "bg-white" : "bg-slate-400"}`} />
            {updating ? "Updating..." : currentValue ? trueText : falseText}
        </button>
    );
}

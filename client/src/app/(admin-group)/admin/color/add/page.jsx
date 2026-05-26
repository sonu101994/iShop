"use client";

import { apiClient, getAuthHeader, titleToSlug } from "@/library/helper";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { HexColorPicker } from "react-colorful";

export default function AddColorPage() {
  const nameRef = useRef(null);
  const slugRef = useRef(null);
  const [color, setColor] = useState("#ff0000");

  // auto slug
  const nameChangeHandler = () => {
    const slug = titleToSlug(nameRef.current.value);
    slugRef.current.value = slug;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!nameRef.current.value || !slugRef.current.value || !color) {
      toast.warning("Please fill all required fields");
      return;
    }

    try {
      const data = {
        name: nameRef.current.value,
        slug: slugRef.current.value,
        color_code: color,
      };

      const response = await apiClient.post(
        "/color/create",
        data,
        getAuthHeader()
      );

      if (response.data.flag == 1) {
        toast.success(response.data.msg);
        e.target.reset();
        slugRef.current.value = "";
        setColor("#ff0000");
      } else {
        toast.warning(response.data.msg);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="admin-page space-y-6">

      {/* HEADER */}
      <div className="admin-page-header">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Add New Color
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600">
            Create and manage product colors
          </p>
        </div>

        <Link
          href="/admin/color"
          className="flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 w-fit"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Colors
        </Link>
      </div>

      {/* FORM CARD */}
      <div className="admin-panel-card p-4 sm:p-6">

        <form onSubmit={submitHandler} className="space-y-6">

          {/* NAME */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Color Name <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              ref={nameRef}
              onChange={nameChangeHandler}
              placeholder="e.g., Red, Blue, Green"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          {/* SLUG */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Slug <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              ref={slugRef}
              readOnly
              placeholder="auto-generated slug"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm sm:text-base text-slate-900"
            />
          </div>

          {/* COLOR PICKER */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Color
            </label>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6">

              {/* picker */}
              <div className="p-3 border rounded-lg bg-gray-50">
                <HexColorPicker color={color} onChange={setColor} />
              </div>

              {/* preview */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="h-12 w-12 rounded-full border shadow"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-600">{color}</span>
              </div>

            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 border-t border-gray-200 pt-4">

            <Link
              href="/admin/color"
              className="w-full sm:w-auto text-center rounded-lg border border-gray-300 px-6 py-2.5 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 py-2.5 text-white hover:bg-slate-800"
            >
              Create Color
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}
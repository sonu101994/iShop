"use client";

import { apiClient, titleToSlug } from "@/library/helper";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { HexColorPicker } from "react-colorful";

export default function EditColorPage() {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    slug: "",
  });

  const [color, setColor] = useState("#ff0000");

  // fetch color
  const fetchColor = async () => {
    try {
      const res = await apiClient.get(`/color?id=${params.color_id}`);

      if (res.data.flag === 1 && res.data.colors?.length > 0) {
        const data = res.data.colors[0];

        setForm({
          name: data.name || "",
          slug: data.slug || "",
        });

        setColor(data.color_code || "#ff0000");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load color");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.color_id) fetchColor();
  }, [params.color_id]);

  // name + slug
  const nameChangeHandler = (e) => {
    const name = e.target.value;

    setForm({
      name,
      slug: titleToSlug(name),
    });
  };

  // submit
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!form.name || !form.slug || !color) {
      toast.warning("Please fill all required fields");
      return;
    }

    try {
      const res = await apiClient.put(`/color/edit/${params.color_id}`, {
        name: form.name,
        slug: form.slug,
        color_code: color,
      });

      if (res.data.flag === 1) {
        toast.success(res.data.msg);
        router.replace("/admin/color");
      } else {
        toast.warning(res.data.msg);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-600">Loading...</div>;
  }

  return (
    <div className="admin-page space-y-6">

      {/* HEADER */}
      <div className="admin-page-header">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Edit Color
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600">
            Update product color details
          </p>
        </div>

        <Link
          href="/admin/color"
          className="flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 w-fit"
        >
          ← Back to Colors
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
              value={form.name}
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
              value={form.slug}
              readOnly
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
              Update Color
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}
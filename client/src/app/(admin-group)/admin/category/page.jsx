import DeleteBtn from "@/components/admin/DeleteBtn.";
import ToggleBtn from "@/components/admin/ToggleBtn";
import { getCategory } from "@/library/api-call";
import { buildImageUrl } from "@/library/helper";
import Link from "next/link";
import { FaPen } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";

export default async function CategoryPage() {
  const { categories, image_path } = await getCategory();
  const base_url = "/category/toggle";

  return (
    <div className="admin-page space-y-6">
      <div className="admin-page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">Manage product departments and homepage category visibility.</p>
        </div>

        <Link
          href="/admin/category/add"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
        >
          <FiPlus size={18} />
          Add Category
        </Link>
      </div>

      <div className="admin-panel-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-600">Category list</p>
        <p className="text-sm text-slate-500">
          Total: <span className="font-semibold text-slate-950">{categories.length}</span> {categories.length === 1 ? "Category" : "Categories"}
        </p>
      </div>

      <div className="admin-panel-card hidden overflow-hidden xl:block">
        <table className="admin-table w-full">
          <thead>
            <tr>
              {["Category", "Slug", "Products", "Settings", "Actions"].map((head) => (
                <th key={head}>{head}</th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <tr key={cat._id} className="transition hover:bg-slate-50/70">
                <td>
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      <img src={buildImageUrl(image_path, cat.image_name)} alt={cat.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">{cat.name}</h3>
                      <p className="mt-1 text-xs text-slate-500">Product Category</p>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{cat.slug}</span>
                </td>

                <td>
                  <span className="font-medium text-slate-700">{cat.product_count || 0} {(cat.product_count || 0) === 1 ? "Product" : "Products"}</span>
                </td>

                <td>
                  <div className="flex flex-wrap gap-2">
                    <ToggleBtn id={cat._id} current={cat.status} flag="1" trueText="Active" falseText="Inactive" base_url={base_url} />
                    <ToggleBtn id={cat._id} current={cat.on_home} flag="2" trueText="On Home" falseText="Not Home" base_url={base_url} />
                    <ToggleBtn id={cat._id} current={cat.is_featured} flag="3" trueText="Featured" falseText="Not Featured" base_url={base_url} />
                    <ToggleBtn id={cat._id} current={cat.is_top} flag="4" trueText="Top" falseText="Not Top" base_url={base_url} />
                  </div>
                </td>

                <td>
                  <div className="flex items-center gap-3">
                    <DeleteBtn delete_url={`/category/delete/${cat._id}`} />
                    <Link href={`/admin/category/edit/${cat._id}`} className="admin-icon-btn">
                      <FaPen size={14} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="py-16 text-center">
            <h3 className="text-lg font-semibold text-slate-700">No Categories Found</h3>
            <p className="mt-1 text-sm text-slate-500">Start by adding your first category.</p>
          </div>
        )}
      </div>

      <div className="grid gap-4 xl:hidden">
        {categories.map((cat) => (
          <div key={cat._id} className="admin-panel-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <img src={buildImageUrl(image_path, cat.image_name)} alt={cat.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-slate-950 sm:text-lg">{cat.name}</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{cat.slug}</span>
                    <span className="inline-block rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">{cat.product_count || 0} {(cat.product_count || 0) === 1 ? "Product" : "Products"}</span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <DeleteBtn delete_url={`/category/delete/${cat._id}`} />
                <Link href={`/admin/category/edit/${cat._id}`} className="admin-icon-btn">
                  <FaPen size={14} />
                </Link>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Settings</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <ToggleBtn id={cat._id} current={cat.status} flag="1" trueText="Active" falseText="Inactive" base_url={base_url} />
                <ToggleBtn id={cat._id} current={cat.on_home} flag="2" trueText="On Home" falseText="Not Home" base_url={base_url} />
                <ToggleBtn id={cat._id} current={cat.is_featured} flag="3" trueText="Featured" falseText="Not Featured" base_url={base_url} />
                <ToggleBtn id={cat._id} current={cat.is_top} flag="4" trueText="Top" falseText="Not Top" base_url={base_url} />
              </div>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="admin-panel-card py-16 text-center">
            <h3 className="text-lg font-semibold text-slate-700">No Categories Found</h3>
            <p className="mt-1 text-sm text-slate-500">Start by adding your first category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

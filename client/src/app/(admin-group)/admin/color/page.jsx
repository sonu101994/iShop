import DeleteBtn from "@/components/admin/DeleteBtn.";
import ToggleBtn from "@/components/admin/ToggleBtn";
import { getColors } from "@/library/api-call";
import Link from "next/link";
import { FaPen } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";

export default async function ColorPage() {
  const { colors } = await getColors();
  const base_url = "/color/toggle";

  return (
    <div className="admin-page space-y-6">
      <div className="admin-page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">Colors</h1>
          <p className="mt-1 text-sm text-slate-500">Manage product colors used on product and cart pages.</p>
        </div>

        <Link
          href="/admin/color/add"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
        >
          <FiPlus size={18} />
          Add Color
        </Link>
      </div>

      <div className="admin-panel-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-600">Color list</p>
        <p className="text-sm text-slate-500">
          Total: <span className="font-semibold text-slate-950">{colors.length}</span> {colors.length === 1 ? "Color" : "Colors"}
        </p>
      </div>

      <div className="admin-panel-card hidden overflow-hidden xl:block">
        <table className="admin-table w-full">
          <thead>
            <tr>
              {["Color", "Slug", "Color Code", "Status", "Actions"].map((head) => (
                <th key={head}>{head}</th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {colors.map((color) => (
              <tr key={color._id} className="transition hover:bg-slate-50/70">
                <td>
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full border border-slate-300" style={{ backgroundColor: color.color_code }} />
                    <span className="font-semibold text-slate-900">{color.name}</span>
                  </div>
                </td>

                <td>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{color.slug}</span>
                </td>

                <td>
                  <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">{color.color_code}</span>
                </td>

                <td>
                  <ToggleBtn id={color._id} current={color.status} base_url={base_url} trueText="Active" falseText="Inactive" />
                </td>

                <td>
                  <div className="flex items-center gap-3">
                    <DeleteBtn delete_url={`/color/delete/${color._id}`} />
                    <Link href={`/admin/color/edit/${color._id}`} className="admin-icon-btn">
                      <FaPen size={14} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {colors.length === 0 && (
          <div className="py-16 text-center">
            <h3 className="text-lg font-semibold text-slate-700">No Colors Found</h3>
            <p className="mt-1 text-sm text-slate-500">Start by adding your first color.</p>
          </div>
        )}
      </div>

      <div className="grid gap-4 xl:hidden">
        {colors.map((color) => (
          <div key={color._id} className="admin-panel-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 shrink-0 rounded-full border border-slate-300" style={{ backgroundColor: color.color_code }} />
                  <h2 className="truncate text-base font-semibold text-slate-950 sm:text-lg">{color.name}</h2>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{color.slug}</span>
                  <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">{color.color_code}</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <DeleteBtn delete_url={`/color/delete/${color._id}`} />
                <Link href={`/admin/color/edit/${color._id}`} className="admin-icon-btn">
                  <FaPen size={14} />
                </Link>
              </div>
            </div>

            <div className="mt-4">
              <ToggleBtn id={color._id} current={color.status} base_url={base_url} trueText="Active" falseText="Inactive" />
            </div>
          </div>
        ))}

        {colors.length === 0 && (
          <div className="admin-panel-card py-16 text-center">
            <h3 className="text-lg font-semibold text-slate-700">No Colors Found</h3>
            <p className="mt-1 text-sm text-slate-500">Start by adding your first color.</p>
          </div>
        )}
      </div>
    </div>
  );
}

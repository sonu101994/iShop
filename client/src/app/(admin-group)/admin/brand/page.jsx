import DeleteBtn from "@/components/admin/DeleteBtn.";
import ToggleBtn from "@/components/admin/ToggleBtn";
import { getBrand } from "@/library/api-call";
import { buildImageUrl } from "@/library/helper";
import Link from "next/link";
import { FaPen } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";

export default async function BrandPage() {
    const { brands, image_path } = await getBrand();
    const base_url = "/brand/toggle";

    return (
        <div className="admin-page space-y-6">
            <div className="admin-page-header">
                <div>
                    <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">Brands</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage product brands and connected categories.</p>
                </div>

                <Link
                    href="/admin/brand/add"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
                >
                    <FiPlus size={18} />
                    Add Brand
                </Link>
            </div>

            <div className="admin-panel-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-slate-600">Brand list</p>
                <p className="text-sm text-slate-500">
                    Total: <span className="font-semibold text-slate-950">{brands.length}</span> {brands.length === 1 ? "Brand" : "Brands"}
                </p>
            </div>

            <div className="admin-panel-card hidden overflow-hidden xl:block">
                <table className="admin-table w-full">
                    <thead>
                        <tr>
                            {["Brand", "Slug", "Category Name(s)", "Image", "Setting", "Actions"].map((head) => (
                                <th key={head}>{head}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {brands.map((brand) => (
                            <tr key={brand._id} className="transition hover:bg-slate-50/70">
                                <td>
                                    <div className="font-semibold text-slate-900">{brand.name}</div>
                                </td>

                                <td>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{brand.slug}</span>
                                </td>

                                <td>
                                    <div className="flex max-w-md flex-wrap gap-2">
                                        {brand.category_ids?.length ? (
                                            brand.category_ids.map((cat) => (
                                                <span key={cat._id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                                    {cat.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-slate-400">No category</span>
                                        )}
                                    </div>
                                </td>

                                <td>
                                    <img
                                        width={55}
                                        height={55}
                                        src={buildImageUrl(image_path, brand.image_name)}
                                        alt={brand.name}
                                        className="h-14 w-14 rounded-xl border border-slate-200 object-cover"
                                    />
                                </td>

                                <td>
                                    <ToggleBtn id={brand._id} current={brand.status} trueText="Active" falseText="Inactive" base_url={base_url} />
                                </td>

                                <td>
                                    <div className="flex items-center gap-3">
                                        <DeleteBtn delete_url={`/brand/delete/${brand._id}`} />
                                        <Link href={`/admin/brand/edit/${brand._id}`} className="admin-icon-btn">
                                            <FaPen size={14} />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {brands.length === 0 && (
                    <div className="py-16 text-center">
                        <h3 className="text-lg font-semibold text-slate-700">No Brands Found</h3>
                        <p className="mt-1 text-sm text-slate-500">Start by adding your first brand.</p>
                    </div>
                )}
            </div>

            <div className="grid gap-4 xl:hidden">
                {brands.map((brand) => (
                    <div key={brand._id} className="admin-panel-card p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <img
                                    width={64}
                                    height={64}
                                    src={buildImageUrl(image_path, brand.image_name)}
                                    alt={brand.name}
                                    className="h-16 w-16 shrink-0 rounded-xl border border-slate-200 object-cover"
                                />
                                <div className="min-w-0">
                                    <h2 className="truncate text-base font-semibold text-slate-950 sm:text-lg">{brand.name}</h2>
                                    <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{brand.slug}</span>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <DeleteBtn delete_url={`/brand/delete/${brand._id}`} />
                                <Link href={`/admin/brand/edit/${brand._id}`} className="admin-icon-btn">
                                    <FaPen size={14} />
                                </Link>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl bg-slate-50 p-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Categories</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {brand.category_ids?.length ? (
                                    brand.category_ids.map((cat) => (
                                        <span key={cat._id} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                                            {cat.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-slate-400">No category</span>
                                )}
                            </div>
                        </div>

                        <div className="mt-4">
                            <ToggleBtn id={brand._id} current={brand.status} trueText="Active" falseText="Inactive" base_url={base_url} />
                        </div>
                    </div>
                ))}

                {brands.length === 0 && (
                    <div className="admin-panel-card py-16 text-center">
                        <h3 className="text-lg font-semibold text-slate-700">No Brands Found</h3>
                        <p className="mt-1 text-sm text-slate-500">Start by adding your first brand.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

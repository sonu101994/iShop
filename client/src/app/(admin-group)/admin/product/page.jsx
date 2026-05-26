import DeleteBtn from "@/components/admin/DeleteBtn.";
import MultipleImage from "@/components/admin/MultipleImage";
import ProductSettingsDropdown from "@/components/admin/ProductSettingsDropdown";
import { getProduct } from "@/library/api-call";
import { buildImageUrl } from "@/library/helper";
import Link from "next/link";
import { FaPen } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";

const money = (value = 0) => `₹${Number(value || 0).toLocaleString("en-IN")}`;



export default async function ProductPage() {
    const { products, image_path, other_image_path } = await getProduct({ limit: 100 });
    const base_url = "/product/toggle";
    const otherImageBaseUrl = buildImageUrl(other_image_path, "__base__").replace("__base__", "");


    return (
        <div className="admin-page space-y-6">
            <div className="admin-page-header">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Catalog</p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Products</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage product details, images, stock and visibility settings.</p>
                </div>

                <Link href="/admin/product/add" className="admin-primary-btn w-full sm:w-auto">
                    <FiPlus size={18} />
                    Add Product
                </Link>
            </div>


            <div className="admin-panel-card hidden overflow-hidden xl:block">
                <div className="border-b border-slate-200 p-5">
                    <h2 className="font-bold text-slate-950">Product list</h2>
                    <p className="mt-1 text-sm text-slate-500">Status changes are available inside Manage settings.</p>
                </div>

                <div className="admin-page-scroll">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                {["Product", "Price", "Colors", "Brand", "Settings", "Actions"].map((head) => (
                                    <th key={head}>{head}</th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {products.map((prod) => {
                                return (
                                    <tr key={prod._id}>
                                        <td>
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                                                    <img src={buildImageUrl(image_path, prod.image_name)} alt={prod.name} className="h-full w-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="max-w-[240px] truncate font-bold text-slate-900">{prod.name}</h3>
                                                    <p className="mt-1 text-xs text-slate-500">SKU: {prod.sku_id || "-"}</p>
                                                    <span className="mt-2 inline-block max-w-[220px] truncate rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{prod.slug}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="space-y-1">
                                                <p className="font-bold text-slate-950">{money(prod.discounted_price)}</p>
                                                <p className="text-xs text-slate-400 line-through">{money(prod.original_price)}</p>
                                            </div>
                                        </td>


                                        <td>
                                            <div className="flex max-w-[220px] flex-wrap gap-1.5">
                                                {prod.color_ids?.length ? prod.color_ids.map((color) => (
                                                    <span key={color._id} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">{color.name}</span>
                                                )) : <span className="text-sm text-slate-400">No colors</span>}
                                            </div>
                                        </td>

                                        <td>
                                            <span className="font-semibold text-slate-700">{prod.brand_id?.name || "N/A"}</span>
                                        </td>

                                        <td>
                                            <ProductSettingsDropdown product={prod} base_url={base_url} />
                                        </td>

                                        <td>
                                            <div className="flex items-center gap-2">
                                                <DeleteBtn delete_url={`/product/delete/${prod._id}`} />
                                                <Link href={`/admin/product/edit/${prod._id}`} className="admin-icon-btn"><FaPen size={14} /></Link>
                                                <MultipleImage delete_url={`/product/delete-other-image/${prod._id}/`} api_url={`/product/add-other-images/${prod._id}`} other_images={prod.other_images} image_url={otherImageBaseUrl} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {products.length === 0 && (
                    <div className="py-16 text-center">
                        <h3 className="text-lg font-semibold text-slate-700">No Products Found</h3>
                        <p className="mt-1 text-sm text-slate-500">Start by adding your first product.</p>
                    </div>
                )}
            </div>

            <div className="grid gap-4 xl:hidden">
                {products.map((prod) => {
                    return (
                        <div key={prod._id} className="admin-mobile-card">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                                        <img src={buildImageUrl(image_path, prod.image_name)} alt={prod.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="truncate text-base font-bold text-slate-950 sm:text-lg">{prod.name}</h2>
                                        <p className="mt-1 text-xs text-slate-500">SKU: {prod.sku_id || "-"}</p>
                                        <span className="mt-2 inline-block max-w-full truncate rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{prod.slug}</span>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                    <DeleteBtn delete_url={`/product/delete/${prod._id}`} />
                                    <Link href={`/admin/product/edit/${prod._id}`} className="admin-icon-btn"><FaPen size={14} /></Link>
                                    <MultipleImage delete_url={`/product/delete-other-image/${prod._id}/`} api_url={`/product/add-other-images/${prod._id}`} other_images={prod.other_images} image_url={otherImageBaseUrl} />
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="admin-soft-card p-3">
                                    <p className="text-xs font-semibold text-slate-500">Price</p>
                                    <p className="mt-1 font-bold text-slate-950">{money(prod.discounted_price)}</p>
                                    <p className="text-xs text-slate-400 line-through">{money(prod.original_price)}</p>
                                </div>
                               
                            </div>

                            <div className="mt-4">
                                <p className="mb-2 text-sm font-semibold text-slate-500">Brand</p>
                                <p className="font-bold text-slate-800">{prod.brand_id?.name || "N/A"}</p>
                            </div>

                            <div className="mt-4">
                                <p className="mb-2 text-sm font-semibold text-slate-500">Colors</p>
                                <div className="flex flex-wrap gap-2">
                                    {prod.color_ids?.length ? prod.color_ids.map((color) => (
                                        <span key={color._id} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">{color.name}</span>
                                    )) : <span className="text-sm text-slate-400">No colors</span>}
                                </div>
                            </div>

                            <div className="mt-4">
                                <p className="mb-2 text-sm font-semibold text-slate-500">Settings</p>
                                <ProductSettingsDropdown product={prod} base_url={base_url} />
                            </div>
                        </div>
                    );
                })}

                {products.length === 0 && (
                    <div className="admin-panel-card py-16 text-center">
                        <h3 className="text-lg font-semibold text-slate-700">No Products Found</h3>
                        <p className="mt-1 text-sm text-slate-500">Start by adding your first product.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

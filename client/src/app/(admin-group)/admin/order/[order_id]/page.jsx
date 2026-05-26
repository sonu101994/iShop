"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient, getAuthHeader, buildImageUrl } from "@/library/helper";
import { toast } from "react-toastify";

const money = (value = 0) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const statusClass = (status) => {
    switch (String(status || "").toLowerCase()) {
        case "pending": return "border-amber-200 bg-amber-50 text-amber-700";
        case "delivered": return "border-slate-900 bg-slate-900 text-white";
        case "cancelled": return "border-slate-200 bg-slate-100 text-slate-500";
        default: return "border-slate-200 bg-slate-50 text-slate-700";
    }
};

export default function OrderDetailsPage() {
    const params = useParams();
    const [order, setOrder] = useState(null);

    // fetch single order
    const fetchOrder = async () => {
        try {
            const response = await apiClient.get(`/order/admin/details/${params.order_id}`, getAuthHeader());
            if (response.data.flag == 1) {
                setOrder(response.data.order);
            } else {
                toast.error(response.data.msg);
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch order");
        }
    };

    useEffect(() => {
        if (params.order_id) fetchOrder();
    }, [params.order_id]);

    if (!order) {
        return <div className="admin-panel-card p-8 text-center text-slate-500">Loading order...</div>;
    }

    const address = order.shipping_address || order.address || {};

    return (
        <div className="admin-page space-y-6">
            <div className="admin-page-header">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Order Details</p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">#{String(order._id).slice(-8)}</h1>
                    <p className="mt-1 text-sm text-slate-500">Customer order, products, payment and address details.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <span className={`admin-status-pill justify-center ${statusClass(order.status)}`}>{order.status}</span>
                    <Link href="/admin/order" className="admin-secondary-btn">Back to Orders</Link>
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
                <div className="admin-panel-card p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Customer</p>
                    <h2 className="mt-2 text-lg font-bold text-slate-950">{order.user_id?.name || order.customer_name || "Customer"}</h2>
                    <p className="mt-1 text-sm text-slate-500">{order.user_id?.email || order.customer_email || "No email"}</p>
                </div>
                <div className="admin-panel-card p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Payment</p>
                    <h2 className="mt-2 text-lg font-bold text-slate-950">{order.payment_method}</h2>
                    <p className="mt-1 text-sm text-slate-500">{order.payment_status || "Pending"}</p>
                </div>
                <div className="admin-panel-card p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Total</p>
                    <h2 className="mt-2 text-lg font-bold text-slate-950">{money(order.total_amount)}</h2>
                    <p className="mt-1 text-sm text-slate-500">Subtotal {money(order.subtotal)}</p>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                <div className="admin-panel-card overflow-hidden">
                    <div className="border-b border-slate-200 p-5">
                        <h2 className="text-lg font-bold text-slate-950">Products</h2>
                        <p className="mt-1 text-sm text-slate-500">Items included in this order.</p>
                    </div>
                    <div className="admin-page-scroll hidden md:block">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Final</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {order.products?.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                                                    <img src={buildImageUrl('/images/products/main_images/', item.image)} alt={item.name} className="h-full w-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-950">{item.name}</p>
                                                    {item.selected_color?.name && <p className="mt-1 text-xs text-slate-500">Color: {item.selected_color.name}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{item.sku_id || "-"}</td>
                                        <td>{item.qty}</td>
                                        <td>{money(item.discounted_price)}</td>
                                        <td className="font-bold text-slate-950">{money(item.final_price || item.discounted_price * item.qty)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid gap-3 p-4 md:hidden">
                        {order.products?.map((item, index) => (
                            <div key={index} className="rounded-2xl border border-slate-200 p-3">
                                <div className="flex gap-3">
                                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                                        <img src={buildImageUrl('/images/products/main_images/', item.image)} alt={item.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-950">{item.name}</p>
                                        <p className="mt-1 text-sm text-slate-500">Qty: {item.qty} • {money(item.discounted_price)}</p>
                                        {item.selected_color?.name && <p className="text-xs text-slate-500">Color: {item.selected_color.name}</p>}
                                    </div>
                                </div>
                                <p className="mt-3 text-right font-bold text-slate-950">{money(item.final_price || item.discounted_price * item.qty)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="admin-panel-card p-5">
                        <h2 className="text-lg font-bold text-slate-950">Order Summary</h2>
                        <div className="mt-4 space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-semibold">{money(order.subtotal)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="font-semibold">-{money(order.discount_total)}</span></div>
                            <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-950"><span>Total</span><span>{money(order.total_amount)}</span></div>
                        </div>
                    </div>

                    <div className="admin-panel-card p-5">
                        <h2 className="text-lg font-bold text-slate-950">Shipping Address</h2>
                        <div className="mt-3 text-sm leading-6 text-slate-600">
                            <p className="font-bold text-slate-900">{address.name || order.user_id?.name || "Customer"}</p>
                            <p>{address.phone || ""}</p>
                            <p>{address.address_line || address.address || ""}</p>
                            <p>{[address.city, address.state, address.pincode].filter(Boolean).join(", ")}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

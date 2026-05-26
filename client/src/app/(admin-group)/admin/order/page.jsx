"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrders } from "@/library/api-call";
import { apiClient, getAuthHeader } from "@/library/helper";
import { toast } from "react-toastify";

const money = (value = 0) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const statusClass = (status) => {
    switch (String(status || "").toLowerCase()) {
        case "pending": return "border-amber-200 bg-amber-50 text-amber-700";
        case "processing": return "border-slate-200 bg-slate-50 text-slate-700";
        case "shipped": return "border-slate-200 bg-slate-50 text-slate-700";
        case "delivered": return "border-slate-900 bg-slate-900 text-white";
        case "cancelled": return "border-slate-200 bg-slate-100 text-slate-500";
        default: return "border-slate-200 bg-slate-50 text-slate-600";
    }
};

export default function OrderPage() {
    const [orders, setOrders] = useState([]);
    const [updating, setUpdating] = useState("");

    const fetchOrders = async () => {
        const { orders } = await getOrders();
        setOrders(orders || []);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // update status
    const updateStatus = async (id, status, currentStatus) => {
        if (status === currentStatus || updating) return;
        try {
            setUpdating(id);
            const response = await apiClient.patch(`/order/admin/status/${id}`, { status }, getAuthHeader());

            if (response.data.flag === 1) {
                toast.success("Status updated");
                fetchOrders();
            } else {
                toast.error(response.data.msg || "Status update failed");
            }
        } catch (error) {
            console.log(error);
            toast.error("Update failed");
        } finally {
            setUpdating("");
        }
    };

    return (
        <div className="admin-page space-y-6">
            <div className="admin-page-header">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Sales</p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Orders</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage customer orders and fulfillment status.</p>
                </div>
            </div>

            <div className="admin-panel-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-bold text-slate-700">Order list</p>
                <p className="text-sm text-slate-500">Total: <span className="font-bold text-slate-950">{orders.length}</span> {orders.length === 1 ? "Order" : "Orders"}</p>
            </div>

            <div className="admin-panel-card hidden overflow-hidden xl:block">
                <div className="admin-page-scroll">
                    <table className="admin-table">
                        <thead>
                            <tr>{["Order", "Customer", "Amount", "Status", "Payment", "Action"].map((head) => <th key={head}>{head}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td className="font-bold text-slate-900">#{order._id.slice(-6)}</td>
                                    <td>
                                        <p className="font-bold text-slate-900">{order.user_id?.name || "Customer"}</p>
                                        <p className="text-xs text-slate-500">{order.user_id?.email || "No email"}</p>
                                    </td>
                                    <td className="font-bold text-slate-950">{money(order.total_amount)}</td>
                                    <td>
                                        <div className="flex flex-col gap-2">
                                            <span className={`admin-status-pill w-fit ${statusClass(order.status)}`}>{order.status}</span>
                                            <select
                                                value={order.status}
                                                disabled={updating === order._id}
                                                onChange={(e) => updateStatus(order._id, e.target.value, order.status)}
                                                className="admin-form-select max-w-[180px] py-2 text-sm"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="admin-status-pill">{order.payment_method}</span>
                                    </td>
                                    <td>
                                        <Link href={`/admin/order/${order._id}`} className="admin-primary-btn px-4 py-2 text-xs">View</Link>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr><td colSpan="6" className="text-center text-slate-500">No orders found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid gap-4 xl:hidden">
                {orders.map((order) => (
                    <div key={order._id} className="admin-mobile-card">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="font-bold text-slate-950">#{order._id.slice(-6)}</h2>
                                <p className="mt-1 text-sm text-slate-500">{order.user_id?.name || "Customer"}</p>
                                <p className="text-xs text-slate-400">{order.user_id?.email || "No email"}</p>
                            </div>
                            <Link href={`/admin/order/${order._id}`} className="admin-primary-btn px-3 py-1.5 text-xs">View</Link>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="admin-soft-card p-3">
                                <p className="text-xs font-semibold text-slate-500">Amount</p>
                                <p className="mt-1 font-bold text-slate-950">{money(order.total_amount)}</p>
                            </div>
                            <div className="admin-soft-card p-3">
                                <p className="text-xs font-semibold text-slate-500">Payment</p>
                                <p className="mt-1 font-bold text-slate-950">{order.payment_method}</p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="mb-2 text-sm font-semibold text-slate-500">Status</p>
                            <select
                                value={order.status}
                                disabled={updating === order._id}
                                onChange={(e) => updateStatus(order._id, e.target.value, order.status)}
                                className="admin-form-select"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                ))}

                {orders.length === 0 && (
                    <div className="admin-panel-card p-6 text-center text-slate-500">No orders found</div>
                )}
            </div>
        </div>
    );
}

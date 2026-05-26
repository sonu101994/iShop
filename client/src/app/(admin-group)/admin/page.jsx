"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient, getAuthHeader } from "@/library/helper";
import { toast } from "react-toastify";

const currency = (value = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const number = (value = 0) => new Intl.NumberFormat("en-IN").format(Number(value || 0));

const statusClass = (status) => {
    switch (String(status || "").toLowerCase()) {
        case "pending":
            return "border-amber-200 bg-amber-50 text-amber-700";
        case "received":
        case "confirmed":
            return "border-blue-200 bg-blue-50 text-blue-700";
        case "processing":
            return "border-violet-200 bg-violet-50 text-violet-700";
        case "delivered":
            return "border-emerald-200 bg-emerald-50 text-emerald-700";
        case "cancelled":
            return "border-slate-200 bg-slate-100 text-slate-500";
        default:
            return "border-slate-200 bg-slate-50 text-slate-600";
    }
};

const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

function StatCard({ title, value, href, tone = "slate" }) {
    const tones = {
        slate: "from-slate-50 to-slate-100",
        blue: "from-sky-50 to-blue-100",
        amber: "from-amber-50 to-orange-100",
        emerald: "from-emerald-50 to-teal-100",
        violet: "from-violet-50 to-indigo-100",
        rose: "from-rose-50 to-pink-100",
    };

    const card = (
        <div className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br ${tones[tone] || tones.slate} p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}>
            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/45" />
            <p className="relative text-sm font-bold text-slate-600">{title}</p>
            <h2 className="relative mt-3 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{value}</h2>
        </div>
    );

    return href ? <Link href={href}>{card}</Link> : card;
}

export default function AdminDashBoard() {
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashBoard = async () => {
        try {
            const response = await apiClient.get("/dashboard", getAuthHeader());

            if (response.data.flag == 1) {
                setStats(response.data.data.stats || {});
                setOrders(response.data.data.recentOrders || []);
            } else {
                toast.error(response.data.msg || "Dashboard data not found");
            }
        } catch (error) {
            console.log(error);
            toast.error("dashboard data not found");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashBoard();
    }, []);

    return (
        <div className="admin-page space-y-6">
            <div className="admin-page-header">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Overview</p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-500">Clean summary of sales, orders, products and customers.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Link href="/admin/product/add" className="admin-primary-btn">Add Product</Link>
                    <Link href="/" className="admin-secondary-btn">Go to website</Link>
                </div>
            </div>

            {loading ? (
                <div className="admin-panel-card flex h-44 items-center justify-center text-slate-500">Loading dashboard...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard title="Total Revenue" value={currency(stats?.totalRevenue)} href="/admin/order" tone="slate" />
                        <StatCard title="Total Orders" value={number(stats?.totalOrders)} href="/admin/order" tone="blue" />
                        <StatCard title="Total Products" value={number(stats?.totalProducts)} href="/admin/product" tone="emerald" />
                        <StatCard title="Customers" value={number(stats?.totalCustomers)} href="/admin/users" tone="violet" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard title="Pending Orders" value={number(stats?.pendingOrders)} href="/admin/order" tone="amber" />
                        <StatCard title="Received Orders" value={number(stats?.receivedOrders)} href="/admin/order" tone="blue" />
                        <StatCard title="Processing Orders" value={number(stats?.processingOrders)} href="/admin/order" tone="violet" />
                        <StatCard title="Delivered Orders" value={number(stats?.deliveredOrders)} href="/admin/order" tone="emerald" />
                    </div>

                    <div className="admin-panel-card overflow-hidden">
                        <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-950">Recent orders</h2>
                                <p className="mt-1 text-sm text-slate-500">Last 5 orders from customers.</p>
                            </div>
                            <Link href="/admin/order" className="admin-secondary-btn w-full sm:w-auto">View all orders</Link>
                        </div>

                        <div className="hidden md:block">
                            <table className="admin-table min-w-full">
                                <thead>
                                    <tr>
                                        {['Order', 'Customer', 'Date', 'Amount', 'Status', 'Payment'].map((head) => <th key={head}>{head}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {orders.map((order) => (
                                        <tr key={order._id}>
                                            <td className="font-bold text-slate-900">#{String(order._id).slice(-6)}</td>
                                            <td>
                                                <p className="font-semibold text-slate-900">{order.user_id?.name || "Customer"}</p>
                                                <p className="text-xs text-slate-500">{order.user_id?.email || "No email"}</p>
                                            </td>
                                            <td className="text-slate-600">{formatDate(order.createdAt)}</td>
                                            <td className="font-semibold text-slate-900">{currency(order.total_amount)}</td>
                                            <td><span className={`admin-status-pill ${statusClass(order.status)}`}>{order.status || "Pending"}</span></td>
                                            <td><span className="admin-status-pill">{order.payment_method || "COD"}</span></td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr><td colSpan="6" className="py-10 text-center text-slate-500">No recent orders found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid gap-4 p-4 md:hidden">
                            {orders.map((order) => (
                                <div key={order._id} className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-bold text-slate-950">#{String(order._id).slice(-6)}</h3>
                                            <p className="mt-1 text-sm text-slate-500">{order.user_id?.name || "Customer"}</p>
                                        </div>
                                        <span className={`admin-status-pill ${statusClass(order.status)}`}>{order.status || "Pending"}</span>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                        <div className="admin-soft-card p-3">
                                            <p className="text-xs font-semibold text-slate-500">Amount</p>
                                            <p className="mt-1 font-bold text-slate-950">{currency(order.total_amount)}</p>
                                        </div>
                                        <div className="admin-soft-card p-3">
                                            <p className="text-xs font-semibold text-slate-500">Payment</p>
                                            <p className="mt-1 font-bold text-slate-950">{order.payment_method || "COD"}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {orders.length === 0 && <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">No recent orders found.</div>}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

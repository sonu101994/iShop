"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { PackageCheck, ShoppingBag, XCircle } from "lucide-react";
import { cancelOrder, getMyOrders } from "@/library/api-call";
import { buildImageUrl } from "@/library/helper";

// format price in indian currency
const formatPrice = (value = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const formatDate = (date) => {
    // show order date in short format
    if (!date) return "";
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(date));
};

// allow cancel only for pending orders
const canCancelOrder = (order) => String(order?.status || "").toLowerCase() === "pending";

const statusClass = (status = "") => {
    // choose badge style by order status
    const value = String(status).toLowerCase();
    if (value === "cancelled") return "bg-rose-50 text-rose-700";
    if (value === "delivered") return "bg-emerald-50 text-emerald-700";
    if (value === "confirmed" || value === "shipped") return "bg-blue-50 text-blue-700";
    return "bg-amber-50 text-amber-700";
};

export default function OrdersPage() {
    const token = useSelector((state) => state.user?.token);

    // store orders and cancel loading state
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState("");

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        // load orders after login
        loadOrders();
    }, [token]);

    async function loadOrders() {
        setLoading(true);

        const response = await getMyOrders();

        // hide unpaid online orders
        const cleanOrders = (response.orders || []).filter(
            (order) => !(order.payment_method === "ONLINE" && order.payment_status === "Pending")
        );

        setOrders(cleanOrders);
        setLoading(false);
    }

    async function handleCancelOrder(orderId) {
        if (!orderId || cancellingId) return;

        // confirm before cancelling
        const confirmCancel = window.confirm("Cancel this pending order?");
        if (!confirmCancel) return;

        setCancellingId(orderId);
        const response = await cancelOrder(orderId);

        if (response.flag === 1) {
            toast.success(response.msg || "Order cancelled");

            // update cancelled order in list
            setOrders((prev) =>
                prev.map((order) =>
                    order._id === orderId
                        ? {
                              ...order,
                              ...(response.order || {}),
                              status: response.order?.status || "Cancelled",
                          }
                        : order
                )
            );
        } else {
            toast.error(response.msg || "Could not cancel order");
        }

        setCancellingId("");
    }

    if (!token) {
        return (
            <div className="bg-slate-50 py-16">
                <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-semibold text-slate-950">Login required</h1>
                    <p className="mt-3 text-slate-500">Please login to view your orders.</p>
                    <Link href="/user/login" className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 py-8">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Orders</p>
                        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">My orders</h1>
                    </div>
                    <Link href="/products" className="inline-flex w-fit rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-400">
                        Continue shopping
                    </Link>
                </div>

                {/* show loading, empty, or orders */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="h-36 animate-pulse rounded-2xl bg-white" />
                        ))}
                    </div>
                ) : !orders.length ? (
                    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-700">
                            <ShoppingBag size={24} />
                        </div>
                        <h2 className="mt-5 text-xl font-semibold text-slate-950">No orders yet</h2>
                        <p className="mt-2 text-slate-500">Your placed orders will appear here.</p>
                        <Link href="/products" className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white">
                            Start shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            // prepare cancel button state
                            const isCancellable = canCancelOrder(order);
                            const isCancelling = cancellingId === order._id;

                            return (
                                <div key={order._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                    <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700">
                                                <PackageCheck size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-950">Order #{String(order._id).slice(-8).toUpperCase()}</p>
                                                <p className="mt-1 text-sm text-slate-500">Placed on {formatDate(order.createdAt)}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
                                            {/* show order and payment badges */}
                                            <div className="flex flex-wrap gap-2">
                                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(order.status || "Pending")}`}>{order.status || "Pending"}</span>
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{order.payment_method || "COD"}</span>
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{order.payment_status || "Pending"}</span>
                                            </div>

                                            {isCancellable && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCancelOrder(order._id)}
                                                    disabled={isCancelling}
                                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                                >
                                                    <XCircle size={16} />
                                                    {isCancelling ? "Cancelling..." : "Cancel order"}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4 sm:p-5">
                                        <div className="space-y-4">
                                            {(order.products || []).map((product, index) => (
                                                <div key={`${order._id}-${product.product_id || index}`} className="flex gap-3">
                                                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                                        <img src={buildImageUrl("/images/products/main_images/", product.image)} alt={product.name} className="h-full w-full object-cover" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="line-clamp-1 font-medium text-slate-950">{product.name}</p>
                                                        <p className="mt-1 text-sm text-slate-500">Qty {product.qty} × {formatPrice(product.discounted_price)}</p>
                                                        {product.color_name && (
                                                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                                                <span className="h-3 w-3 rounded-full border border-slate-200" style={{ backgroundColor: product.color_code || "#e2e8f0" }} />
                                                                Color: {product.color_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <p className="shrink-0 text-sm font-semibold text-slate-950">{formatPrice(product.final_price)}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* show saved delivery address */}
                                        {order.shipping_address && (
                                            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                                                <p className="font-semibold text-slate-950">Deliver to {order.shipping_address.name}</p>
                                                <p className="mt-1 leading-6">
                                                    {order.shipping_address.address}, {order.shipping_address.locality}, {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                                                </p>
                                            </div>
                                        )}

                                        {/* show order total */}
                                        <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                            <p className="text-sm text-slate-500">{order.products?.length || 0} product(s)</p>
                                            <p className="text-lg font-semibold text-slate-950">{formatPrice(order.total_amount)}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
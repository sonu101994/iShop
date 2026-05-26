"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { UserRound, Mail, Phone, MapPin, PackageCheck, Heart, ShoppingCart } from "lucide-react";
import { getAddresses, getMyOrders, getWishlist } from "@/library/api-call";

export default function ProfilePage() {
    const user = useSelector((state) => state.user?.data);
    const token = useSelector((state) => state.user?.token);
    const cartCount = useSelector((state) => state.cart?.cartCount || 0);

    // store profile counts
    const [stats, setStats] = useState({ orders: 0, addresses: 0, wishlist: 0 });

    useEffect(() => {
        if (!token) return;

        async function loadStats() {
            // load all profile stats
            const [ordersResponse, addressResponse, wishlistResponse] = await Promise.all([
                getMyOrders(),
                getAddresses(),
                getWishlist(),
            ]);

            setStats({
                // skip unpaid online orders
                orders: (ordersResponse.orders || []).filter(
                    (order) => !(order.payment_method === "ONLINE" && order.payment_status === "Pending")
                ).length,
                addresses: (addressResponse.addresses || []).length,
                wishlist: (wishlistResponse.wishlist || []).length,
            });
        }

        loadStats();
    }, [token]);

    if (!token) {
        return (
            <div className="bg-slate-50 py-16">
                <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-semibold text-slate-950">Login required</h1>
                    <p className="mt-3 text-slate-500">Please login to view your profile.</p>
                    <Link href="/user/login" className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    // profile shortcut cards
    const quickLinks = [
        { href: "/orders", label: "My orders", value: stats.orders, icon: PackageCheck },
        { href: "/addresses", label: "Addresses", value: stats.addresses, icon: MapPin },
        { href: "/wishlist", label: "Wishlist", value: stats.wishlist, icon: Heart },
        { href: "/cart", label: "Cart items", value: cartCount, icon: ShoppingCart },
    ];

    return (
        <div className="bg-slate-50 py-8">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                {/* profile summary */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-700">
                                <UserRound size={28} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">My profile</p>
                                <h1 className="text-2xl font-semibold text-slate-950">{user?.name || "Customer"}</h1>
                            </div>
                        </div>
                        <Link href="/products" className="inline-flex w-fit rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
                            Continue shopping
                        </Link>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 p-4">
                            <Mail className="mb-3 text-slate-600" size={20} />
                            <p className="text-sm text-slate-500">Email</p>
                            <p className="mt-1 break-all font-medium text-slate-950">{user?.email || "Not available"}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 p-4">
                            <Phone className="mb-3 text-slate-600" size={20} />
                            <p className="text-sm text-slate-500">Phone</p>
                            <p className="mt-1 font-medium text-slate-950">{user?.phone || "Not available"}</p>
                        </div>
                    </div>
                </div>

                {/* account quick links */}
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {quickLinks.map((item) => {
                        // render dynamic icon
                        const Icon = item.icon;
                        return (
                            <Link key={item.href} href={item.href} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-400">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700">
                                        <Icon size={18} />
                                    </div>
                                    <span className="text-2xl font-semibold text-slate-950">{item.value}</span>
                                </div>
                                <p className="mt-4 font-medium text-slate-950">{item.label}</p>
                                <p className="mt-1 text-sm text-slate-500">Open and manage</p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
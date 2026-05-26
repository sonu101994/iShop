"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";

export default function Hero() {
    
    const [adminToken, setAdminToken] = useState("");

    useEffect(() => {
        // getting admin  token after mount to login in admin panel
        setAdminToken(localStorage.getItem("admin_token") || "");
    }, []);

    return (
        <section className="border-b border-slate-100 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 text-white shadow-sm">
                    <div className="grid gap-0 lg:grid-cols-[1.15fr_.85fr]">
                        <div className="p-6 sm:p-8 lg:p-10">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                                <ShoppingBag size={15} />
                                iShop electronics
                            </div>

                            <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                                Shop here ,Where Technology meets style
                            </h1>

                            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
                                Discover phones,laptops, gadgets and all electronic accessories on single platform.trusted by millions of customers.
                            </p>

                            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <Link href="/products" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100">
                                    Explore all products
                                    <ArrowRight size={17} />
                                </Link>
                                {/* if admin token ==>> anyway (no) */}
                                {adminToken && (
                                    <Link href="/admin" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
                                        Admin panel
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
                            <div className="grid h-full content-center gap-4">
                                <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
                                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-950">
                                        <ShieldCheck size={22} />
                                    </div>
                                    <h2 className="mt-5 text-2xl font-semibold">Reliable store experience</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                       Discover the latest gadgets, premium electronics, and a shopping experience designed to make every purchase simple and enjoyable.
                                    </p>
                                </div>

                                {/* quick payment badges */}
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                                        <p className="text-2xl font-bold">COD</p>
                                        <p className="mt-1 text-slate-300">Available</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                                        <p className="text-2xl font-bold">Online</p>
                                        <p className="mt-1 text-slate-300">Razorpay</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

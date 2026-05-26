"use client";

import Link from "next/link";

export default function AuthLayout({ children, title, subtitle }) {
    return (
        <section className="min-h-screen bg-slate-50 px-4 py-10">
            <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="grid min-h-[620px] lg:grid-cols-[0.9fr_1.1fr]">
                    {/*  */}
                    <div className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
                        <Link href="/" className="text-2xl font-semibold tracking-tight">
                            iShop
                        </Link>
                        <div>
                            <h2 className="text-3xl font-semibold tracking-tight">Welcome to simple shopping</h2>
                            <p className="mt-4 max-w-sm leading-7 text-slate-300">
                                Login or create your account to save cart items and continue checkout.
                            </p>
                        </div>
                        <p className="text-sm text-slate-400">Clean ecommerce experience</p>
                    </div>

                    {/* right panel me login/register form */}
                    <div className="flex items-center justify-center p-6 sm:p-10">
                        <div className="w-full max-w-md">
                            {/* mobile screen par brand link form ke upar show karte hain kyunki left panel hidden hota hai */}
                            <Link href="/" className="mb-8 inline-block text-2xl font-semibold tracking-tight text-slate-950 lg:hidden">
                                iShop
                            </Link>
                            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
                            <p className="mt-2 text-slate-500">{subtitle}</p>
                            {/* form real */}
                            <div className="mt-8">{children}</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

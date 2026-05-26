"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { useSelector } from "react-redux";

export default function Footer() {
    const token = useSelector((state) => state.user?.token);
    // footer year dynamic
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-4">
                    <div className="md:col-span-1">
                        <Link href="/" className="text-2xl font-semibold tracking-tight text-slate-950">
                            iShop
                        </Link>
                        <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
                            Simple ecommerce website with dynamic products, filters and cart.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-950">Shop</h3>
                        <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
                            <Link href="/" className="hover:text-slate-950">Home</Link>
                            <Link href="/products" className="hover:text-slate-950">Products</Link>
                            <Link href="/cart" className="hover:text-slate-950">Cart</Link>
                        </div>
                    </div>

                    {/* login state ==>>show||hide */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-950">Account</h3>
                        <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
                            {token ? (
                                // logged-in customer profile 
                                <>
                                    <Link href="/profile" className="hover:text-slate-950">Profile</Link>
                                    <Link href="/addresses" className="hover:text-slate-950">Addresses</Link>
                                    <Link href="/orders" className="hover:text-slate-950">Orders</Link>
                                </>
                            ) : (
                                // guest user
                                <>
                                    <Link href="/user/login" className="hover:text-slate-950">Login</Link>
                                    <Link href="/user/register" className="hover:text-slate-950">Sign up</Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/*  static support details  */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-950">Contact</h3>
                        <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
                            <span className="flex items-center gap-2"><Mail size={15} /> support@ishop.com</span>
                            <span className="flex items-center gap-2"><Phone size={15} /> +91 8852968227</span>
                            <span className="flex items-center gap-2"><MapPin size={15} /> Jaipur, India</span>
                        </div>
                    </div>
                </div>

                {/* bottom line footer  */}
                <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-500">
                    © {year} iShop. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

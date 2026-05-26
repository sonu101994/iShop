"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useSelector } from "react-redux";

export default function MobileMenu({ open, user, token, adminToken, closeMenu, handleLogout }) {
    // cart badge mobile menu me bhi same redux count se update hota hai
    const cartCount = useSelector((state) => state.cart?.cartCount || 0);

    // closed
    if (!open) return null;

    return (
        <div className="absolute left-0 top-full z-50 w-full border-t border-slate-200 bg-white shadow-lg md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 p-4">
                {/* logged-in user */}
                {token && (
                    <div className="mb-2 rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Logged in</p>
                        <p className="font-semibold text-slate-950">{user?.name || "Customer"}</p>
                    </div>
                )}

                <Link href="/" onClick={closeMenu} className="rounded-xl px-3 py-3 font-medium text-slate-700 hover:bg-slate-50">
                    Home
                </Link>
                <Link href="/products" onClick={closeMenu} className="rounded-xl px-3 py-3 font-medium text-slate-700 hover:bg-slate-50">
                    Products
                </Link>
                <Link href="/wishlist" onClick={closeMenu} className="rounded-xl px-3 py-3 font-medium text-slate-700 hover:bg-slate-50">
                    Wishlist
                </Link>
                {/* admin link if admin token */}
                {adminToken && (
                    <Link href="/admin" onClick={closeMenu} className="rounded-xl px-3 py-3 font-medium text-slate-700 hover:bg-slate-50">
                        Admin dashboard
                    </Link>
                )}
                {/* account pages only for logged in */}
                {token && (
                    <>
                        <Link href="/profile" onClick={closeMenu} className="rounded-xl px-3 py-3 font-medium text-slate-700 hover:bg-slate-50">
                            Profile
                        </Link>
                        <Link href="/addresses" onClick={closeMenu} className="rounded-xl px-3 py-3 font-medium text-slate-700 hover:bg-slate-50">
                            Addresses
                        </Link>
                        <Link href="/orders" onClick={closeMenu} className="rounded-xl px-3 py-3 font-medium text-slate-700 hover:bg-slate-50">
                            Orders
                        </Link>
                    </>
                )}
                {/* cart link  */}
                <Link href="/cart" onClick={closeMenu} className="flex items-center justify-between rounded-xl px-3 py-3 font-medium text-slate-700 hover:bg-slate-50">
                    <span className="flex items-center gap-2">
                        <ShoppingCart size={18} /> Cart
                    </span>
                    {cartCount > 0 && <span className="rounded-full bg-slate-950 px-2 py-1 text-xs text-white">{cartCount}</span>}
                </Link>

                {/* bottom action depends on login state */}
                {!token ? (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <Link href="/user/login" onClick={closeMenu} className="rounded-full border border-slate-200 py-2.5 text-center text-sm font-medium text-slate-700">
                            Login
                        </Link>
                        <Link href="/user/register" onClick={closeMenu} className="rounded-full bg-slate-950 py-2.5 text-center text-sm font-medium text-white">
                            Sign up
                        </Link>
                    </div>
                ) : (
                    <button type="button" onClick={handleLogout} className="mt-3 rounded-full bg-slate-950 py-2.5 text-sm font-medium text-white">
                        Logout
                    </button>
                )}
            </div>
        </div>
    );
}

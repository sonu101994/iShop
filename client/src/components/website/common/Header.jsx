"use client";

import Link from "next/link";
import { Menu, X, ShoppingCart, UserRound } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser, lsToUser } from "@/redux/reducers/UserReducers";
import { clearCart, restoreCart, syncCart } from "@/redux/reducers/CartReducers";
import { useEffect, useState } from "react";
import MobileMenu from "./MobileMenu";
import { getCartItems } from "@/library/api-call";

export default function Header() {
    const dispatch = useDispatch();
    // mobile menu and admin states to control
    const [mobileMenu, setMobileMenu] = useState(false);
    const [adminToken, setAdminToken] = useState("");

    const user = useSelector((state) => state.user?.data);
    const token = useSelector((state) => state.user?.token);
    const cartCount = useSelector((state) => state.cart?.cartCount || 0);

    useEffect(() => {
        // hyest cart
        dispatch(lsToUser());
        dispatch(restoreCart());
        setAdminToken(localStorage.getItem("admin_token") || "");
    }, [dispatch]);

    useEffect(() => {
        let active = true;
// after login token||login user
        const syncServerCart = async () => {
            
            if (!token) return;
            const response = await getCartItems();
            if (active && response.flag === 1) {
                dispatch(syncCart(response.cart || []));
            }
        };

        syncServerCart();

        return () => {
            active = false;
        };
    }, [token, dispatch]);

    const handleLogout = () => {
        // logout=>>cart cleared
        dispatch(logoutUser());
        dispatch(clearCart());
        setMobileMenu(false);
    };

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-4">
                    <Link href="/" className="text-2xl font-semibold tracking-tight text-slate-950">
                        iShop
                    </Link>

                    <nav className="hidden items-center gap-8 md:flex">
                        <Link href="/" className="text-sm font-medium text-slate-700 hover:text-slate-950">
                            Home
                        </Link>
                        <Link href="/products" className="text-sm font-medium text-slate-700 hover:text-slate-950">
                            Products
                        </Link>
                        <Link href="/wishlist" className="text-sm font-medium text-slate-700 hover:text-slate-950">
                            Wishlist
                        </Link>
                        {/* admin token available==>>admin panel*/}
                        {adminToken? (
                            <Link href="/admin" className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200">
                                Admin
                            </Link>
                        ): <Link href="/admin/login" className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200">
                                Admin Login
                            </Link>}
                    </nav>

                    <div className="flex items-center gap-3">
                        {/* cart icon badge unique cart item count  */}
                        <Link href="/cart" className="relative grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-700 hover:border-slate-400 hover:text-slate-950">
                            <ShoppingCart size={20} />
                            {cartCount > 0 && (
                                <span className="absolute -right-1.5 -top-1.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-slate-950 px-1 text-[11px] font-semibold text-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* btn show||hidden depends on login state */}
                        <div className="hidden items-center gap-3 md:flex">
                            {token ? (
                                <>
                                    <Link href="/profile" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-950">
                                        <UserRound size={16} />
                                        {user?.name || "Account"}
                                    </Link>
                                    <button type="button" onClick={handleLogout} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/user/login" className="text-sm font-medium text-slate-700 hover:text-slate-950">
                                        Login
                                    </Link>
                                    <Link href="/user/register" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* mobile menu btn */}
                        <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
                            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* mobile menu */}
            <MobileMenu open={mobileMenu} user={user} token={token} adminToken={adminToken} closeMenu={() => setMobileMenu(false)} handleLogout={handleLogout} />
        </header>
    );
}

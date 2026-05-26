"use client";

import Link from "next/link";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux/reducers/UserReducers";

export default function UserDropdown({ user, closeMenu }) {
    const dispatch = useDispatch();

    const logout = () => {
        // logout and close menu
        dispatch(logoutUser());
        closeMenu?.();
    };

    return (
        <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            <div className="border-b border-slate-100 p-3 font-black text-slate-950">{user?.name || "Customer"}</div>

            <Link href="/profile" className="block rounded-xl p-3 font-semibold text-slate-700 hover:bg-slate-50">
                Profile
            </Link>

            <Link href="/orders" className="block rounded-xl p-3 font-semibold text-slate-700 hover:bg-slate-50">
                Orders
            </Link>

            {/* logout highlighting */}
            <button type="button" onClick={logout} className="w-full rounded-xl p-3 text-left font-semibold text-rose-600 hover:bg-rose-50">
                Logout
            </button>
        </div>
    );
}

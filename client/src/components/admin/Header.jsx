"use client";

import { logoutAdmin, lsToAdmin } from "@/redux/reducers/AdminReducers";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSidebar } from "./SideBarContext";

export default function Header() {
    // dispatcher for actions
    const dispatcher = useDispatch();

    // dropdown menu show and hide
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // navigation handler
    const router = useRouter();

    // current admin state from redux store
    const admin = useSelector((state) => state.admin);
    const [isChecking, setIsChecking] = useState(true);

    // redirect to login
    const logoutHandler = () => {
        dispatcher(logoutAdmin());
        router.push("/admin/login");
    };

    useEffect(() => {
        dispatcher(lsToAdmin());
        setIsChecking(false);
    }, [dispatcher]);

    useEffect(() => {
        if (!isChecking) {
            if (!admin.data || !admin.token) {
                router.push("/admin/login");
            }
        }
    }, [isChecking, admin.data, admin.token, router]);

    // sidebar state
    const { isOpen, setIsOpen } = useSidebar();

    return (
        <header
            className={`fixed right-0 top-0 z-40 h-16 border-b border-slate-200 bg-white/95 backdrop-blur transition-all duration-300 ${
                isOpen ? "lg:left-64" : "lg:left-20"
            } left-0`}
        >
            <div className="h-full px-3 sm:px-4 lg:px-6">
                <div className="flex h-full items-center justify-between gap-3">
                    {/* left part-logo */}
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsOpen(true)}
                            className="grid h-10 w-10 place-items-center rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 lg:hidden"
                            aria-label="Open admin menu"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="min-w-0">
                            <h1 className="truncate text-lg font-bold text-gray-800 sm:text-xl lg:text-2xl">iShop Admin</h1>
                            <p className="hidden text-xs text-gray-500 sm:block">Management panel</p>
                        </div>
                    </div>

                    {/* right part */}
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                        <Link
                            href="/"
                            className="hidden rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 md:inline-flex"
                        >
                            Go to website
                        </Link>

                        {/* notifications */}
                        <button className="relative hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 sm:flex">
                            {/* bell icon */}
                            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {/* not read yet */}
                            <span className="absolute right-2 top-2 block h-2 w-2 rounded-full bg-slate-900"></span>
                        </button>

                        {/* admin account */}
                        <div className="relative">
                            {/* set profile state */}
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-gray-100 sm:gap-3 sm:p-2"
                            >
                                {/* Profile logo */}
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white sm:h-10 sm:w-10">
                                    {(admin.data?.name || "A").charAt(0).toUpperCase()}
                                </div>

                                {/* admin details */}
                                <div className="hidden min-w-0 text-left lg:block">
                                    <p className="max-w-[140px] truncate text-sm font-medium text-gray-900">{admin.data?.name}</p>
                                    <p className="max-w-[180px] truncate text-xs text-gray-500">{admin.data?.email}</p>
                                </div>

                                {/* dropdown arrow */}
                                <svg className={`hidden h-5 w-5 text-gray-500 transition-transform duration-200 sm:block ${isProfileOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* dropdown menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white py-2 shadow-lg">
                                    {/* mobile admin info */}
                                    <div className="border-b border-gray-100 px-4 py-3 lg:hidden">
                                        <p className="truncate text-sm font-semibold text-gray-900">{admin.data?.name}</p>
                                        <p className="mt-1 truncate text-xs text-gray-500">{admin.data?.email}</p>
                                    </div>

                                    {/* redirect to profile */}
                                    <Link href="/admin/profile" className="flex px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                        Profile Settings
                                    </Link>

                                    <Link href="/" className="flex px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                        Go to website
                                    </Link>

                                    <hr className="my-2 border-gray-100" />

                                    {/* Logout button */}
                                    <button className="block w-full px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50" onClick={logoutHandler}>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

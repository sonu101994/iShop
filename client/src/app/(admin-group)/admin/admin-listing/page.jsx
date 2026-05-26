"use client";
import { useEffect,useState } from "react";
import { getAdmins } from "@/library/api-call";
import { apiClient,getAuthHeader } from "@/library/helper";
import { toast } from "react-toastify";
import Link from "next/link";

export default function AdminListingPage(){
    const [admins,setAdmins]=useState([]);
    const [loading,setLoading]=useState(true);

    // fetch admin
    //
    const fetchAdmins =async ()=>{
        setLoading(true);
        const response=await getAdmins();
        setAdmins(response.admins||[]);
        setLoading(false);
    };

    useEffect(()=>{
        fetchAdmins();
    }, []);

    // toggle status

    const updateStatus=async (id)=>{
        try {
            // console.log("hitting");
            const response=await apiClient.patch(
                `/admin/status/${id}`,
                {},
                getAuthHeader()
            );
             if (response.data.flag === 1) {
                toast.success(response.data.msg || "Updated");
                fetchAdmins();
            } else {
                console.log("hitting");
                toast.error(response.data.msg);
            }

        } catch (error) {
            console.log("hitting");
              toast.error("Server error");
        }
    };

      // role assigner
    const roleLabel = (role) => {
        if (role === 0) return "Super Admin";
        if (role === 1) return "Admin";
        if (role === 2) return "Manager";
        return "Unknown";
    };

      return (
        <div className="admin-page space-y-6">

            {/* HEADER */}
            <div className="admin-page-header">

                <div>
                    <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
                        Admins
                    </h1>
                    <p className="text-sm text-gray-500">
                        Manage system administrators
                    </p>
                </div>

                {/* ADD BUTTON */}
                <Link
                    href="/admin/admin-listing/add"
                    className="inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                    + Add Admin
                </Link>

            </div>

            {/* DESKTOP TABLE */}
            <div className="admin-panel-card hidden overflow-hidden md:block">

                {loading ? (
                    <div className="p-10 text-center">Loading...</div>
                ) : admins.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No Admins Found
                    </div>
                ) : (

                    <table className="w-full">

                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-3 text-left">Name</th>
                                <th className="p-3 text-left">Email</th>
                                <th className="p-3 text-left">Role</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {admins.map((admin) => (
                                <tr key={admin._id} className="border-b border-slate-100 hover:bg-slate-50/70">

                                    <td className="p-3 font-medium">
                                        {admin.name}
                                    </td>

                                    <td className="p-3 text-gray-600">
                                        {admin.email}
                                    </td>

                                    <td className="p-3">
                                        <span className="px-2 py-1 text-xs bg-gray-200 rounded">
                                            {roleLabel(admin.role)}
                                        </span>
                                    </td>

                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs rounded ${
                                            admin.status
                                                ? "bg-slate-900 text-white"
                                                : "bg-slate-100 text-slate-600"
                                        }`}>
                                            {admin.status ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    <td className="p-3 flex gap-2">

                                        {/* EDIT */}
                                        <Link
                                            href={`/admin/admin-listing/edit/${admin._id}`}
                                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                            Edit
                                        </Link>

                                        {/* TOGGLE */}
                                        <button
                                            onClick={() => updateStatus(admin._id)}
                                            className="rounded-lg bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800"
                                        >
                                            Toggle
                                        </button>

                                    </td>

                                </tr>
                            ))}
                        </tbody>

                    </table>

                )}

            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden space-y-4">

                {loading ? (
                    <div className="text-center">Loading...</div>
                ) : admins.length === 0 ? (
                    <div className="text-center text-gray-500">
                        No Admins Found
                    </div>
                ) : (

                    admins.map((admin) => (
                        <div
                            key={admin._id}
                            className="admin-panel-card p-4"
                        >

                            <div className="font-semibold text-gray-800">
                                {admin.name}
                            </div>

                            <div className="text-sm text-gray-500">
                                {admin.email}
                            </div>

                            <div className="mt-2 flex gap-2">

                                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                    {roleLabel(admin.role)}
                                </span>

                                <span className={`text-xs px-2 py-1 rounded ${
                                    admin.status
                                        ? "bg-slate-900 text-white"
                                        : "bg-slate-100 text-slate-600"
                                }`}>
                                    {admin.status ? "Active" : "Inactive"}
                                </span>

                            </div>

                            <div className="mt-3 flex gap-2">

                                <Link
                                    href={`/admin/admin-listing/edit/${admin._id}`}
                                    className="flex-1 rounded-lg border border-slate-200 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Edit
                                </Link>

                                <button
                                    onClick={() => updateStatus(admin._id)}
                                    className="flex-1 rounded-lg bg-slate-950 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                                >
                                    Toggle
                                </button>

                            </div>

                        </div>
                    ))

                )}

            </div>

        </div>
    );
}

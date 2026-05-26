"use client";

import { useEffect, useState } from "react";
import { apiClient, getAuthHeader } from "@/library/helper";
import { toast } from "react-toastify";
import DeleteBtn from "@/components/admin/DeleteBtn.";
import ToggleBtn from "@/components/admin/ToggleBtn";

export default function UsersPage() {
    const [users, setUsers] = useState([]);

    // get users
    const fetchUsers = async () => {
        try {
            const response = await apiClient.get("/admin/users/", getAuthHeader());

            if (response.data.flag === 1) {
                setUsers(response.data.users || []);
            } else {
                toast.error(response.data.msg);
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch users");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="admin-page space-y-6">
            <div className="admin-page-header">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Customers</p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Users</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage customer accounts and access status.</p>
                </div>
            </div>

            <div className="admin-panel-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-bold text-slate-700">User list</p>
                <p className="text-sm text-slate-500">Total: <span className="font-bold text-slate-950">{users.length}</span> {users.length === 1 ? "User" : "Users"}</p>
            </div>

            <div className="admin-panel-card hidden overflow-hidden md:block">
                <div className="admin-page-scroll">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.length > 0 ? users.map((user) => (
                                <tr key={user._id}>
                                    <td className="font-bold text-slate-900">{user.name}</td>
                                    <td className="text-slate-600">{user.email}</td>
                                    <td>{user.phone || "-"}</td>
                                    <td><ToggleBtn id={user._id} current={user.status} base_url="/admin/users/toggle" trueText="Active" falseText="Blocked" /></td>
                                    <td><DeleteBtn delete_url={`/admin/users/${user._id}`} /></td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" className="text-center text-slate-500">No users found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid gap-4 md:hidden">
                {users.length > 0 ? users.map((user) => (
                    <div key={user._id} className="admin-mobile-card">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h2 className="truncate font-bold text-slate-950">{user.name}</h2>
                                <p className="mt-1 truncate text-sm text-slate-500">{user.email}</p>
                                <p className="mt-1 text-sm text-slate-500">{user.phone || "-"}</p>
                            </div>
                            <DeleteBtn delete_url={`/admin/users/${user._id}`} />
                        </div>
                        <div className="mt-4">
                            <ToggleBtn id={user._id} current={user.status} base_url="/admin/users/toggle" trueText="Active" falseText="Blocked" />
                        </div>
                    </div>
                )) : (
                    <div className="admin-panel-card p-6 text-center text-slate-500">No users found</div>
                )}
            </div>
        </div>
    );
}

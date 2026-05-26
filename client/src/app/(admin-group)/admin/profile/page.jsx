"use client";

import { apiClient, getAuthHeader } from "@/library/helper";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function AdminProfilePage() {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "" });

    // get profile
    const fetchProfile = async () => {
        try {
            const response = await apiClient.get("/admin/profile", getAuthHeader());
            if (response.data.flag === 1) {
                setAdmin(response.data.admin);
            } else {
                toast.error(response.data.msg);
            }
        } catch (error) {
            toast.error("failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // change password
    const changePassword = async () => {
        try {
            const response = await apiClient.put("/admin/change-password", passwords, getAuthHeader());
            if (response.data.flag == 1) {
                toast.success(response.data.msg);
                setShowModal(false);
                setPasswords({ oldPassword: "", newPassword: "" });
            } else {
                toast.error(response.data.msg);
            }
        } catch (error) {
            console.log(error);
            toast.error("password change failed");
        }
    };

    if (loading) {
        return <div className="admin-panel-card p-8 text-center text-slate-500">Loading profile...</div>;
    }

    return (
        <div className="admin-page space-y-6">
            <div className="admin-page-header">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Account</p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Admin Profile</h1>
                    <p className="mt-1 text-sm text-slate-500">View your admin account details and update password.</p>
                </div>
                <button type="button" onClick={() => setShowModal(true)} className="admin-primary-btn w-full sm:w-auto">Change Password</button>
            </div>

            <div className="admin-panel-card max-w-4xl p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="grid h-20 w-20 place-items-center rounded-3xl bg-slate-950 text-2xl font-bold text-white">
                        {(admin?.name || "A").charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-950">{admin?.name}</h2>
                        <p className="mt-1 text-sm text-slate-500">{admin?.email}</p>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="admin-soft-card p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Role</p>
                        <p className="mt-2 font-bold text-slate-950">{admin?.role === 0 ? "Super Admin" : admin?.role === 1 ? "Admin" : "Manager"}</p>
                    </div>
                    <div className="admin-soft-card p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Status</p>
                        <span className={`mt-2 admin-status-pill ${admin?.status ? "admin-status-pill-dark" : ""}`}>{admin?.status ? "Active" : "Inactive"}</span>
                    </div>
                    <div className="admin-soft-card p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Access</p>
                        <p className="mt-2 font-bold text-slate-950">Admin panel</p>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button type="button" aria-label="Close modal" onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
                    <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-950">Change Password</h2>
                        <p className="mt-1 text-sm text-slate-500">Enter old and new password.</p>

                        <div className="mt-5 space-y-4">
                            <input
                                type="password"
                                placeholder="Enter Old Password"
                                value={passwords.oldPassword}
                                onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                autoComplete="off"
                                className="admin-form-input"
                            />
                            <input
                                type="password"
                                placeholder="Enter New Password"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                autoComplete="off"
                                className="admin-form-input"
                            />
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button type="button" onClick={() => setShowModal(false)} className="admin-secondary-btn">Cancel</button>
                            <button type="button" onClick={changePassword} className="admin-primary-btn">Update</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

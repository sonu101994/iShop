"use client";

import { useEffect, useState } from "react";
import { apiClient, getAuthHeader } from "@/library/helper";
import { toast } from "react-toastify";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditAdminPage() {
    const { admin_id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: "", email: "", role: 1, status: true });

    // fetch single admin
    const fetchAdmin = async () => {
        try {
            const response = await apiClient.get(`/admin/single/${admin_id}`, getAuthHeader());
            if (response.data.flag === 1) {
                setForm(response.data.admin);
            } else {
                toast.error(response.data.msg);
            }
        } catch (error) {
            console.log(error);
            toast.error("Error fetching admin");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmin();
    }, [admin_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient.put(`/admin/update/${admin_id}`, form, getAuthHeader());
            if (response.data.flag === 1) {
                toast.success(response.data.msg);
                router.push("/admin/admin-listing");
            } else {
                toast.error(response.data.msg);
            }
        } catch (error) {
            console.log(error);
            toast.error("Update failed");
        }
    };

    if (loading) {
        return <div className="admin-panel-card p-8 text-center text-slate-500">Loading...</div>;
    }

    return (
        <div className="admin-page space-y-6">
            <div className="admin-page-header">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Admins</p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Edit Admin</h1>
                    <p className="mt-1 text-sm text-slate-500">Update admin account details.</p>
                </div>
                <Link href="/admin/admin-listing" className="admin-secondary-btn w-full sm:w-auto">Back</Link>
            </div>

            <div className="admin-panel-card max-w-2xl p-5 sm:p-6">
                <form onSubmit={submitHandler} className="space-y-4">
                    <div>
                        <label className="admin-form-label">Name</label>
                        <input name="name" value={form.name || ""} onChange={handleChange} className="admin-form-input" />
                    </div>
                    <div>
                        <label className="admin-form-label">Email</label>
                        <input value={form.email || ""} disabled className="admin-form-input bg-slate-50 text-slate-500" />
                    </div>
                    <div>
                        <label className="admin-form-label">Role</label>
                        <select name="role" value={form.role} onChange={handleChange} className="admin-form-select">
                            <option value={1}>Admin</option>
                            <option value={2}>Manager</option>
                        </select>
                    </div>
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                        <input type="checkbox" checked={!!form.status} onChange={() => setForm({ ...form, status: !form.status })} />
                        Active admin account
                    </label>
                    <button type="submit" className="admin-primary-btn w-full">Update Admin</button>
                </form>
            </div>
        </div>
    );
}

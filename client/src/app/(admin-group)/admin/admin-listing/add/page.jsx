"use client";
import { useState } from "react";
import { apiClient, getAuthHeader } from "@/library/helper";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddAdminPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", email: "", password: "", role: 1 });

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient.post("/admin/register", form, getAuthHeader());
            if (response.data.flag === 1) {
                toast.success(response.data.msg || "Admin created");
                router.push("/admin/admin-listing");
            } else {
                toast.error(response.data.msg || "Could not create admin");
            }
        } catch (error) {
            console.log(error);
            toast.error("Server error");
        }
    };

    return (
        <div className="admin-page space-y-6">
            <div className="admin-page-header">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Admins</p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Add Admin</h1>
                    <p className="mt-1 text-sm text-slate-500">Create a new admin account.</p>
                </div>
                <Link href="/admin/admin-listing" className="admin-secondary-btn w-full sm:w-auto">Back</Link>
            </div>

            <div className="admin-panel-card max-w-2xl p-5 sm:p-6">
                <form onSubmit={submitHandler} className="space-y-4">
                    <div>
                        <label className="admin-form-label">Name</label>
                        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="admin-form-input" required />
                    </div>
                    <div>
                        <label className="admin-form-label">Email</label>
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="admin-form-input" required />
                    </div>
                    <div>
                        <label className="admin-form-label">Password</label>
                        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="admin-form-input" required />
                    </div>
                    <div>
                        <label className="admin-form-label">Role</label>
                        <select value={form.role} onChange={(e) => setForm({ ...form, role: Number(e.target.value) })} className="admin-form-select">
                            <option value={1}>Admin</option>
                            <option value={2}>Manager</option>
                        </select>
                    </div>
                    <button className="admin-primary-btn w-full">Create Admin</button>
                </form>
            </div>
        </div>
    );
}

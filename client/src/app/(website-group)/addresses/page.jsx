"use client";

import { addAddress, deleteAddress, getAddresses, updateAddress } from "@/library/api-call";
import { Home, MapPin, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

// blank address shape 
const emptyAddress = {
    name: "",
    mobile: "",
    pincode: "",
    address: "",
    locality: "",
    city: "",
    state: "",
    landmark: "",
    address_type: "home",
    is_default: false,
};

export default function AddressesPage() {
    const token = useSelector((state) => state.user?.token);
    // states to handle address,form,saved address,busy
    const [addresses, setAddresses] = useState([]);
    const [form, setForm] = useState(emptyAddress);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [busyId, setBusyId] = useState("");

    useEffect(() => {
        // login?=>>load:""
        if (!token) {
            setLoading(false);
            return;
        }
        loadAddresses();
    }, [token]);

    const loadAddresses = async () => {
        // saved addresses from db
        setLoading(true);
        const response = await getAddresses();
        if (response.flag === 1) {
            setAddresses(response.addresses || []);
        } else {
            toast.error(response.msg || "Could not load addresses");
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const validate = () => {
        // validating at the time of checkout empty fields
        const required = ["name", "mobile", "pincode", "address", "locality", "city", "state"];
        const missing = required.find((key) => !String(form[key] || "").trim());
        if (missing) {
            toast.error("Please fill complete address details");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        // address save ==>>default address
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        const response = await addAddress({
            ...form,
            is_default: form.is_default || addresses.length === 0,
        });

        if (response.flag === 1) {
            setAddresses(response.addresses || []);
            setForm(emptyAddress);
            setShowForm(false);
            toast.success(response.msg || "Address added");
        } else {
            toast.error(response.msg || "Could not save address");
        }
        setSaving(false);
    };

    const handleDefault = async (addressId) => {
        // setting up default address
        setBusyId(addressId);
        const response = await updateAddress(addressId, { is_default: true });
        if (response.flag === 1) {
            setAddresses(response.addresses || []);
            toast.success("Default address updated");
        } else {
            toast.error(response.msg || "Could not update address");
        }
        setBusyId("");
    };

    const handleDelete = async (addressId) => {
        // delete  address and default address set again
        setBusyId(addressId);
        const response = await deleteAddress(addressId);
        if (response.flag === 1) {
            setAddresses(response.addresses || []);
            toast.success(response.msg || "Address deleted");
        } else {
            toast.error(response.msg || "Could not delete address");
        }
        setBusyId("");
    };

    if (!token) {
        return (
            <div className="bg-slate-50 py-16">
                <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-semibold text-slate-950">Login required</h1>
                    <p className="mt-3 text-slate-500">Please login to manage your addresses.</p>
                    <Link href="/user/login" className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 py-8">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* account heading ke saath add form toggle rakha hai taki user isi page par address add kar sake */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Account</p>
                        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">My addresses</h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowForm((prev) => !prev)}
                        className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                    >
                        <Plus size={16} /> {showForm ? "Close form" : "Add new address"}
                    </button>
                </div>

                {/* showform?open:""*/}
                {showForm && (
                    <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-950">Add delivery address</h2>
                                <p className="text-sm text-slate-500">This address can be used during checkout.</p>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
                            <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="Mobile number" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
                            <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
                            <input name="locality" value={form.locality} onChange={handleChange} placeholder="Locality" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
                            <textarea name="address" value={form.address} onChange={handleChange} placeholder="Address" className="min-h-24 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400 md:col-span-2" />
                            <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
                            <input name="state" value={form.state} onChange={handleChange} placeholder="State" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
                            <input name="landmark" value={form.landmark} onChange={handleChange} placeholder="Landmark optional" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
                            <select name="address_type" value={form.address_type} onChange={handleChange} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400">
                                <option value="home">Home</option>
                                <option value="office">Office</option>
                            </select>
                            <label className="flex items-center gap-2 text-sm text-slate-600 md:col-span-2">
                                <input type="checkbox" name="is_default" checked={Boolean(form.is_default)} onChange={handleChange} />
                                Save as default address
                            </label>
                        </div>

                        <button type="submit" disabled={saving} className="mt-5 rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60">
                            {saving ? "Saving..." : "Save address"}
                        </button>
                    </form>
                )}

                {/* loading, empty aur saved address list*/}
                {loading ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {[1, 2].map((item) => (
                            <div key={item} className="h-40 animate-pulse rounded-2xl bg-white" />
                        ))}
                    </div>
                ) : !addresses.length ? (
                    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-700">
                            <Home size={24} />
                        </div>
                        <h2 className="mt-5 text-xl font-semibold text-slate-950">No saved address</h2>
                        <p className="mt-2 text-slate-500">Add an address to make checkout faster.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* har saved address apne default badge aur actions ke saath card me show hota hai */}
                        {addresses.map((address) => (
                            <div key={address._id} className="rounded-2xl border border-slate-200 bg-white p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-slate-950">{address.name}</p>
                                        <p className="mt-1 text-sm text-slate-600">{address.mobile}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {address.is_default && <span className="rounded-full bg-slate-950 px-2.5 py-1 text-xs text-white">Default</span>}
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs capitalize text-slate-600">{address.address_type}</span>
                                    </div>
                                </div>

                                <p className="mt-4 text-sm leading-6 text-slate-600">
                                    {address.address}, {address.locality}, {address.city}, {address.state} - {address.pincode}
                                </p>
                                {address.landmark && <p className="mt-1 text-sm text-slate-500">Landmark: {address.landmark}</p>}

                                {/* default aur delete action */}
                                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                                    {!address.is_default && (
                                        <button
                                            type="button"
                                            onClick={() => handleDefault(address._id)}
                                            disabled={busyId === address._id}
                                            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-400 disabled:opacity-60"
                                        >
                                            Make default
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(address._id)}
                                        disabled={busyId === address._id}
                                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-rose-200 hover:text-rose-600 disabled:opacity-60"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

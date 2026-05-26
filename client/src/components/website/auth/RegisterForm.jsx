"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { userRegisterApi } from "@/library/api-call";

const RegisterForm = () => {

    const router = useRouter();

    // loading state
    const [loading, setLoading] = useState(false);

    // form data default
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const inputHandler = (e) => {

        // form data to send server
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const submitHandler = async (e) => {

        // preventing page refresh
        e.preventDefault();

        // password mismatch 
        if (
            formData.password !==
            formData.confirmPassword
        ) {

            alert(
                "Password and confirm password mismatch"
            );

            return;
        }

        try {

            setLoading(true);

            // sending req
            const response = await userRegisterApi({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
            });

            const data = response.data;//response data

            if (data.flag === 1) {

                alert("Registration successful");

                // redirect to login page
                router.push("/user/login");

            } else {

                alert(data.msg);
            }

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);
        }
    };

    return (

        <form
            onSubmit={submitHandler}
            className="space-y-5"
        >

            <div>

                <label
                    className="
                    block
                    mb-2
                    font-medium
                "
                >
                    Name
                </label>

                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={inputHandler}
                    placeholder="Enter name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                    required
                />

            </div>

            {/* email */}
            <div>

                <label
                    className="
                    block
                    mb-2
                    font-medium
                "
                >
                    Email
                </label>

                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={inputHandler}
                    placeholder="Enter email"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                    required
                />

            </div>

            {/* phone number*/}
            <div>

                <label
                    className="
                    block
                    mb-2
                    font-medium
                "
                >
                    Phone
                </label>

                <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={inputHandler}
                    placeholder="Enter phone"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                    required
                />

            </div>

            {/* password  */}
            <div>

                <label
                    className="
                    block
                    mb-2
                    font-medium
                "
                >
                    Password
                </label>

                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={inputHandler}
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                    required
                />

            </div>

            {/* confirm password */}
            <div>

                <label
                    className="
                    block
                    mb-2
                    font-medium
                "
                >
                    Confirm Password
                </label>

                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={inputHandler}
                    placeholder="Confirm password"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                    required
                />

            </div>

            {/* submit */}
            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-slate-950 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
                {
                    loading
                        ? "Please wait..."
                        : "Create Account"
                }
            </button>

            {/* existing customer==>login page */}
            <p
                className="
                text-center
                text-sm
            "
            >
                Already have an account?{" "}

                <Link
                    href="/user/login"
                    className="font-medium text-slate-950 underline-offset-4 hover:underline"
                >
                    Login
                </Link>

            </p>

        </form>
    );
};

export default RegisterForm;
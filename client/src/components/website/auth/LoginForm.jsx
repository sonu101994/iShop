"use client";

import Link from "next/link";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

import { userLoginApi } from "@/library/api-call";
import { loginUser } from "@/redux/reducers/UserReducers";

export default function LoginForm () {

    const router = useRouter();
    const dispatch = useDispatch();

    // loading state
    const [loading, setLoading] = useState(false);

    // setting up form data
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const inputHandler = (e) => {

        // input 
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const submitHandler = async (e) => {

        // form refresh preventing
        e.preventDefault();

        try {

            setLoading(true);

            // sending req to login
            const response = await userLoginApi(
                formData
            );

            const data = response.data;//response data

            if (data.flag === 1) {

               

                // successful login==>user data and token=>save=>loginUser reducer
                dispatch(
                    loginUser({
                        data: data.user,
                        token: data.token,
                    })
                );

                // 
                router.push("/");

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

            {/* email field  */}
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

            {/* password field  */}
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

            {/* loading */}
            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-slate-950 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
                {
                    loading
                        ? "Please wait..."
                        : "Login"
                }
            </button>

            {/* new customer register redirection*/}
            <p
                className="
                text-center
                text-sm
            "
            >
                Don't have an account?{" "}

                <Link
                    href="/user/register"
                    className="font-medium text-slate-950 underline-offset-4 hover:underline"
                >
                    Register
                </Link>

            </p>

        </form>
    );
};


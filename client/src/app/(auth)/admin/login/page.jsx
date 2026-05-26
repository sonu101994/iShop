"use client";
import Link from "next/link";
import { apiClient } from "@/library/helper";
import { loginAdmin } from "@/redux/reducers/AdminReducers";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { ArrowRight } from "lucide-react";
import WebsiteLayout from './../../../(website-group)/layout';


// admin login page
export default function AdminLoginPage() {
    const router = useRouter();
    const dispatcher = useDispatch();

    const submitHandler = async (e) => {
        console.log("form submit");
        e.preventDefault();
        const data = {
            email: e.target.email.value,
            password: e.target.password.value,
        };

        try {
            const response = await apiClient.post("/admin/login", data);

            console.log(response.data);

            if (response.data.flag == 1) {
                const admin_data = response.data.admin;
                const admin_token = response.data.token;
                console.log(admin_token, admin_data);

                dispatcher(loginAdmin(
                    {
                        data: admin_data,
                        token: admin_token
                    }
                ))

                toast.success(response.data.msg);
                e.target.reset();

                setTimeout(() => {
                    router.push("/admin");
                }, 1000);
            } else {
                toast.error(response.data.msg);
            }
        } catch (error) {

              console.log("FULL ERROR:", error);
    console.log("RESPONSE:", error.response);
    console.log("DATA:", error.response?.data);
            console.log(error);
            toast.error("Something went wrong");

        }
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">

            <div className="w-full max-w-md">

                <div className="bg-white rounded-lg shadow-2xl p-8">

                    {/* header */}
                    <div className="text-center mb-8">

                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            Admin Login
                        </h1>

                        <p className="text-slate-600">
                            Sign in to your account
                        </p>

                    </div>

                    {/* form */}
                    <form onSubmit={submitHandler} className="space-y-6">

                        {/* email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email Address
                            </label>

                            <input
                                type="email"
                                name="email"
                                autoComplete="new-email"
                                placeholder="admin@example.com"
                                className="w-full  text-slate-900 px-4 py-2 border border-slate-300 placeholder:text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                autoComplete="new-password"
                                placeholder="Enter Password"
                                className="w-full px-4 py-2 text-slate-900 border border-slate-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                        >
                            Sign In
                        </button>

                    </form>
                
                        <Link href="/"  className="flex  justify-center align-center gap-2  mt-2 bg-blue-500 text-white font-semibold px-4 py-2 w-full  rounded-lg">
                                <span>  Go To Website</span>
                             <ArrowRight size={16} className="self-center" />
                        </Link>
                        
                    

                </div>

            </div>

        </div>
    );
}

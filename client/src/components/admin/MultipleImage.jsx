"use client";

import { apiClient, getAuthHeader } from "@/library/helper";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { RiGalleryFill } from "react-icons/ri";
import { toast } from "react-toastify";

export default function MultipleImage(
    {
        api_url,
        other_images,
        delete_url,
        image_url,
    }
) {

    const [otherImages, setOtherImages] = useState(other_images);

    const [toggle, setToggle] = useState(false);
    const [loading, setLoading] = useState(false);

    // delete other images handler

    const deleteHandler = (idx) => {
        apiClient.delete(delete_url + idx,getAuthHeader()).then(
            (response) => {
                if (response.data.flag == 1) {
                    toast.success(response.data.msg);
                    setOtherImages(response.data.current_other_images);
                }
            }
        ).catch((error) => {
            console.log(error);
            toast.error(
                error?.response?.data?.msg || "Something went wrong"
            );
        })
    }

    // upload image handler
    const uploadHandler = async(e) => {
        console.log("submit form");
        e.preventDefault();
        const images = e.target.other_images.files;
        const formData = new FormData();

        for (let img of images) {
            formData.append("other_images", img);
        }
        console.log("API URL:", api_url);
console.log("FORM DATA:", formData);
console.log("FILES:", images);
        setLoading(true);
      const response= await apiClient.post(api_url, formData,getAuthHeader()
            )
            // console.log(response.data);
            .then(
            (response) => {
                if (response.data.flag == 1) {
                    toast.success(response.data.msg);
                    setOtherImages(response.data.current_other_images);
                    e.target.reset();
                    console.log("hii");
                }
            }
        ).catch((error) => {
            console.log(error);
            toast.error(
                error?.response?.data?.msg || "Something went wrong"
            )
        })
            .finally(() => {
                setLoading(false);
            })
    }

    return (
        <div>
            {/* open modal button */}
            <button onClick={() => setToggle(true)} className="admin-icon-btn">
                <RiGalleryFill size={18} />
            </button>

            {/* modal */}
            {toggle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3"
                >
                    {/* modal box */}
                    <div className="w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* header */}
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                Product Gallery
                            </h2>
                            <button onClick={() => setToggle(false)} className="text-sm text-red-500 hover:text-red-700 transition">
                                Close
                            </button>
                        </div>

                        {/* body */}
                        <div className="p-6">
                            {/* images */}
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-600 mb-4">
                                    Uploaded Images
                                </h3>

                                {otherImages?.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {otherImages.map((img_name, idx) => (
                                            <div key={idx} className="border rounded-xl overflow-hidden bg-gray-50">
                                                <img src={image_url + img_name}
                                                    alt={img_name}
                                                    className="w-full h-40 object-cover" />

                                                <div className="p-2">
                                                    <button onClick={() => deleteHandler(idx)}
                                                        className="w-full flex items-center justify-center gap-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg transition">
                                                        <FaTrash size={14} />

                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500">
                                        No images uploaded yet
                                    </div>
                                )}
                            </div>
                            {/* form */}
                            <form
                                onSubmit={uploadHandler}
                                className="space-y-4"
                            >

                                <div>

                                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                                        Add New Images
                                    </label>

                                    <input
                                        multiple
                                        name="other_images"
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-black transition focus:outline-none"
                                    />

                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className={`w-full py-3 rounded-xl font-medium transition ${loading
                                        ? "bg-gray-400 cursor-not-allowed text-white"
                                        : "bg-black text-white hover:bg-gray-800"
                                        }`}
                                >

                                    {loading
                                        ? "Uploading..."
                                        : "Upload Images"}

                                </button>

                            </form>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
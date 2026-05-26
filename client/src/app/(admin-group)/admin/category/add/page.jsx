"use client";

import { apiClient,titleToSlug,getAuthHeader } from "@/library/helper";
import Link from "next/link";
import { useRef,useState } from "react";
import { toast } from "react-toastify";

export default function AddCategoryPage(){
    const nameRef=useRef(null);
    const slugRef=useRef(null);
    const imageRef=useRef(null);

    const [preview ,setPreview]=useState(null);
    const [fileName,setFileName]=useState("");

    // auto generate slug
    const nameChangeHandler =()=>{
        const slug=titleToSlug(nameRef.current.value);
        slugRef.current.value=slug;
    };

    const imagePreviewHandler=(e)=>{
        const file=e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            setFileName(file.name);
        }

    };

    // remove selected image
    const removeImageHandler=()=>{
        setPreview(null);
        setFileName("");

        if (imageRef.current) {
            imageRef.current.value="";
        }
    };

    // form submit handler

    const submitHandler=async(e)=>{
        e.preventDefault();

        if (nameRef.current.value.trim()===""||slugRef.current.value.trim()==="") {
            toast.warning("Please fill all required fields");
            return;
        }
        try {
            const image_file=imageRef.current.files[0];
            const formData=new FormData();
            formData.append("name",nameRef.current.value);
            formData.append("slug",slugRef.current.value);

            if (image_file) {
                formData.append("image",image_file);
            }

            const response=await apiClient.post("/category/create",
                formData,getAuthHeader()
            );

            if (response.data.flag==1) {
                toast.success(response.data.msg);
                e.target.reset();
                slugRef.current.value="";
                setPreview(null);
                setFileName("");
            }else{
                toast.warning(response.data.msg);
            }
        } catch (error) {
            console.log(error);
             toast.warning("Something went wrong");
        }
    };

    return (
        
    <div className="admin-page space-y-6">

      {/* header */}
      <div className="admin-page-header">

        <div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Add New Category
          </h1>

          <p className="mt-1 text-sm sm:text-base text-gray-600">
            Create a new product category
          </p>

        </div>

        <Link
          href="/admin/category"
          className="flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 w-fit"
        >

          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>

          Back to Categories

        </Link>

      </div>

      {/* Form */}
      <div className="admin-panel-card p-4 sm:p-6">

        <form
          onSubmit={submitHandler}
          encType="multipart/form-data"
          className="space-y-6"
        >

          {/* Category Name */}
          <div>

            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Category Name <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              id="name"
              ref={nameRef}
              onChange={nameChangeHandler}
              name="name"
              placeholder="e.g., Electronics, Clothing, Books"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900"
            />

          </div>

          {/* Slug */}
          <div>

            <label
              htmlFor="slug"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Slug <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              id="slug"
              readOnly
              ref={slugRef}
              placeholder="e.g., electronics, clothing, books"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm sm:text-base focus:outline-none text-slate-900"
            />

          </div>

          {/* image Upload */}
          <div>

            <label
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Category Image
            </label>

              {/* hidden File Input */}
              <input
                type="file"
                id="image"
                accept="image/png, image/jpeg"
                ref={imageRef}
                name="image"
                onChange={imagePreviewHandler}
                className="hidden text-slate-900"
              />

              {/* upload here */}
              <label
                htmlFor="image"
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer rounded-lg border border-gray-300 px-4 py-3 hover:border-slate-900"
              >

                <div className="flex items-center gap-3 overflow-hidden">

                  <svg
                    className="h-5 w-5 text-gray-500 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 10.828a4 4 0 10-5.656-5.656L5.757 11.757a6 6 0 108.486 8.486L20.5 14"
                    />
                  </svg>

                  <span className="truncate text-sm text-gray-600">

                    {fileName || "Choose Image"}

                  </span>

                </div>

                {/* remove Icon */}
                {fileName && (

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeImageHandler();
                    }}
                    className="self-end sm:self-auto text-gray-400 hover:text-red-500"
                  >

                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>

                  </button>
                )}

              </label>

              <p className="mt-2 text-xs text-gray-500">
                PNG or JPEG supported
              </p>

              {/* image preview */}
              {preview && (

                <div className="mt-4">

                  <img
                    src={preview}
                    alt="Preview"
                    className="h-28 w-28 sm:h-32 sm:w-32 rounded-lg border border-gray-200 object-cover"
                  />

                </div>
              )}


          </div>

          {/* actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 border-t border-gray-200 pt-4">

            <Link
              href="/admin/category"
              className="w-full sm:w-auto text-center rounded-lg border border-gray-300 px-6 py-2.5 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 py-2.5 text-white hover:bg-slate-800"
            >

              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>

              Create Category

            </button>

          </div>

        </form>

      </div>

    </div>
    );
}
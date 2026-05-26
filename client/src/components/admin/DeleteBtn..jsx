"use client";

import { apiClient,getAuthHeader } from "@/library/helper";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaTrash,FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { GiConfirmed } from "react-icons/gi";

export default function DeleteBtn({delete_url}){
    const [show,setShow]=useState(false);

    const router=useRouter();
    

    // Delete request handler
    const deleteHandler=async()=>{
        try {
            const response=await apiClient.delete(delete_url,getAuthHeader());

            if (response.data.flag==1) {
                toast.success(response.data.msg);
                router.refresh();
            }else{
                toast.warning(response.data.msg);
            }
        } catch (error) {
            toast.warning("something went wrong")
        } finally{
            setShow(false);
        }
    };

    return (

        <>
            {/* popup show for confirmation */}
            <Popup 
            show={show}
            yesHandler={deleteHandler}
            noHandler={()=>setShow(false)}
            />

            {/* trigger-btn for deletion */}
            <button 
            onClick={()=>setShow(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
            >
                 <FaTrash size={14} />
            </button>
        
        </>
    );
}

// popup component
const Popup=({show,noHandler,yesHandler})=>{
    return (
          <div
            className={`fixed inset-0 z-50 ${
                show ? "flex" : "hidden"
            } items-center justify-center bg-black/40 px-4`}
        >
             <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                   {/* close button */}
                <div className="flex justify-end">

                    <button
                        onClick={noHandler}
                        className="text-gray-400 transition hover:text-gray-600"
                    >

                        <FaTimes size={16} />

                    </button>

                </div>
                  {/* icon */}
                <div className="flex justify-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">

                        <FaTrash size={24} />

                    </div>

                </div>
                 {/* title */}
                <div className="mt-4 text-center">

                    <h2 className="text-lg font-semibold text-gray-900">
                        Delete Item
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Are you sure you want to delete this item?
                    </p>

                </div>
                    {/* actions */}
                <div className="mt-6 flex items-center justify-center gap-3">

                    <button
                        onClick={noHandler}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={yesHandler}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >

                        <GiConfirmed size={18} />

                        Delete

                    </button>

                </div>

             </div>
        </div>
        
    )
}
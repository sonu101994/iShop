"use client";
import Header from "@/components/admin/Header";
import SideBar from "@/components/admin/SideBar";
import { SideBarProvider, useSidebar } from "@/components/admin/SideBarContext";

// handles layout spacing based on a sidebar state
function AdminLayoutContent({ children }) {
    // access sidebar expand/collapse status
    const { isOpen } = useSidebar();
    return (
        <div className="min-h-screen overflow-x-hidden bg-slate-50">
            {/* header fixed on top */}
            <Header />
            {/* sidebar panel */}
            <SideBar />
            <main className={`pt-16 transition-all duration-300 ${isOpen ? "lg:ml-64" : "lg:ml-20"}`}>
                <div className="mx-auto w-full max-w-[1500px] p-3 sm:p-5 lg:p-7">
                    {/* pages renders here */}
                    {children}
                </div>
            </main>
        </div>
    );
}

export default function AdminLayout({ children }) {
    return (
        <SideBarProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </SideBarProvider>
    );
}

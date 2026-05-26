"use client";
import { createContext, useContext, useEffect, useState } from "react";

const SideBarContext = createContext();

export function SideBarProvider({ children }) {
    const [isOpen, setIsOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const syncSidebar = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            setIsOpen(!mobile);
        };

        syncSidebar();
        window.addEventListener("resize", syncSidebar);
        return () => window.removeEventListener("resize", syncSidebar);
    }, []);

    return (
        <SideBarContext.Provider value={{ isOpen, setIsOpen, isMobile }}>
            {children}
        </SideBarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SideBarContext);

    if (!context) {
        throw new Error("useSidebar must be used within sidebar Provider");
    }
    return context;
}

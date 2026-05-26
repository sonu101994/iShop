import Header from "@/components/website/common/Header";
import Footer
 from "@/components/website/common/Footer";

export default function WebsiteLayout({ children }) {
    return (
        <div className="min-h-screen bg-white text-slate-950">
            {/* header aur footer common */}
            <Header />
            {/* pages content here */}
            <main>{children}</main>
            <Footer />
        </div>
    );
}

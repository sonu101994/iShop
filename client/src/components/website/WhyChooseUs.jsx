import { Truck, ShieldCheck, Headphones, RefreshCcw } from "lucide-react";

export default function WhyChooseUs() {
    // feature cards 
    const features = [
        { icon: <Truck size={22} />, title: "Fast delivery", desc: "Clean order flow for quick shopping." },
        { icon: <ShieldCheck size={22} />, title: "Secure cart", desc: "Logged-in carts save in database." },
        { icon: <RefreshCcw size={22} />, title: "Live updates", desc: "Cart badge updates only for unique items." },
        { icon: <Headphones size={22} />, title: "Support ready", desc: "Simple layout customers can understand." },
    ];

    return (
        <section className="border-t border-slate-100 bg-white py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-7 max-w-2xl">
                    <p className="text-sm font-medium text-slate-500">Why iShop</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                        Simple, clear and useful
                    </h2>
                    <p className="mt-2 text-slate-600">
                        No heavy effects—just a practical ecommerce layout for real customers.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* feature array==>>cards render */}
                    {features.map((item) => (
                        <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="mb-4 grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700">{item.icon}</div>
                            <h3 className="font-semibold text-slate-950">{item.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

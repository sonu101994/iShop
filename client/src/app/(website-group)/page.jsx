import FeaturedProducts from "@/components/website/FeaturedProduts";
import HomeCategories from "@/components/website/HomeCategories";
import TopProducts from "@/components/website/TopProducts";
import Hero from "@/components/website/hero";

export default function HomePage() {
    return (
        <div className="bg-white">
            {/* hero section */}
            <Hero />
            {/* home categories */}
            <HomeCategories />
            {/* featured products */}
            <FeaturedProducts />
            {/* popular/top  products */}
            <TopProducts />
        </div>
    );
}

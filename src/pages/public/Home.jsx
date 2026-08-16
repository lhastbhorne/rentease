import Hero from "../../components/home/Hero";
import Stats from "../../components/home/Stats";
import Features from "../../components/home/Features";
import HowItWorks from "../../components/home/HowItworks";
import FeaturedProperties from "../../components/home/FeaturedProperties";
import Categories from "../../components/home/Categories";
import Testimonials from "../../components/home/Testimonials";
import CTA from "../../components/home/CTA";
import Footer from "../../components/layout/Footer";
function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <FeaturedProperties />
      <Categories />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
}

export default Home;
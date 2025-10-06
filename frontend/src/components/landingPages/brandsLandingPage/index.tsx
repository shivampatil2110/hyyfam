import GettingStartedSection from "./GettingStarted";
import AutoScrollBrands from "./AutoScrollBrands";
import BrandCount from "./BrandCount";
import BrandVisibility from "./BrandVisibility";
import HeroSection from "./HeroSection";
import Services from "./Services";
import TestimonialSection from "./Testimonials";
import FAQWrapper from "./FaqWrapper";

const index = () => {
  return (
    <div className="w-full h-auto font-inter">
      <HeroSection />
      <Services />
      <BrandCount />
      <AutoScrollBrands />
      <FAQWrapper />
      <GettingStartedSection />
      <TestimonialSection />
      <BrandVisibility />
    </div>
  );
};

export default index;

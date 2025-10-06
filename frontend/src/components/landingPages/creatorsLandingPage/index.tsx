import AutoScrollBrands from "./AutoScrollBrands";
import CreatorCards from "./CreatorCards";
import CreatorCarousel from "./CreatorCarousel";
import CreatorCount from "./CreatorCount";
import CreatorJoin from "./CreatorJoin";
import GettingStartedSection from "./GettingStarted";
import HeroSection from "./HeroSection";
import Testimonials from "./Reviews";
import FAQWrapper from "./FaqWrapper";
import ContentSeo from "./content";

const index = () => {
  return (
    <div className="w-full h-auto font-inter">
      <HeroSection />
      <CreatorCarousel />
      <CreatorCount />
      <CreatorCards />
      <AutoScrollBrands />
      <GettingStartedSection />
      <ContentSeo />
      <FAQWrapper />
      <Testimonials />
      <CreatorJoin />
    </div>
  );
};

export default index;

// import React from 'react'

import AboutSection from "./AboutSection";
import HeroSection from "./HeroSection";
import Promotion from "./Promotion";
import Values from "./Values";

const index = () => {
  return (
    <div className="w-full h-auto font-inter">
      <HeroSection />
      <AboutSection />
      <Values />
      <Promotion />
    </div>
  );
};

export default index;

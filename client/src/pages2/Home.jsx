import React from 'react';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import CausesSection from '../components/CausesSection';
import DonateSection from '../components/DonateSection';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <CausesSection />
      <DonateSection />
      <Footer />
    </>
  );
};

export default Home;

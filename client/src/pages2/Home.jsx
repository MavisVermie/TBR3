import React from 'react';
import HeroSection from '../components/HeroSection';
import WelcomeSection from '../components/WelcomeSection';
import StatsSection from '../components/StatsSection';
import ProcessSection from '../components/ProcessSection';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <>
      <HeroSection />
      <WelcomeSection />
      <StatsSection />
      <ProcessSection />
      <Footer />
    </>
  );
};

export default Home;

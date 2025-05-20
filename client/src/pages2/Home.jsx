import React from 'react';
import HeroSection from '../components/HeroSection';
import MissionSection from '../components/MissionSection';
import StatsSection from '../components/StatsSection';
import Footer from '../components/Footer';
const Home=()=>{
    return (
        <div>
           <HeroSection />
           <MissionSection />
           <StatsSection />
           <Footer />
        </div>
    );
};
export default Home;
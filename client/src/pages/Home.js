import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaRegNewspaper } from "react-icons/fa6";

const BarSection = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div className="flex flex-col items-center w-full px-4 my-10">
      <div className="flex flex-wrap justify-center md:justify-between w-full min-h-[800px] gap-4">
        <div
          className={`bg-[#0b5f7db2] w-full md:w-[23%] h-auto md:h-[700px] mx-2 rounded-md mt-0 transition-all duration-700  hover : shadow-xl ease-out ${
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          } hover:scale-105  duration-300`}
        >
          <img src="/1.gif" className="w-full h-full object-cover rounded-md" />
        </div>

        <div
          className={`bg-contimg w-full md:w-[23%] h-auto md:h-[700px] mx-2 rounded-md mt-4 md:mt-16 transition-all duration-700 ease-out delay-100 ${
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          } hover:scale-105 duration-300`}
        >
          <p className="py-12 px-6 font-medium text-black text-[18px] tracking-wide leading-relaxed text-justify">
            <span className="font-semibold text-lg">TBR3</span> is a Jordanian-born platform inspired by the Arabic word{" "}
            <span className="font-serif font-bold">"تبَرّع"</span> meaning <span className="font-serif font-bold">"to donate"</span>, reflecting a mission rooted in giving, sustainability, and community care.
            <br /><br />
            It allows people to share second-hand items instead of discarding them — reducing waste and offering support to those in need.
            <br /><br />
            The platform promotes a circular economy and social solidarity by encouraging users to give instead of throw away.
            <img src="/new.gif" className="h-64 px-32 mx-auto" />
          </p>
        </div>

        <div
          className={`bg-[#0b5e7d] w-full md:w-[23%] h-auto md:h-[700px] mx-2 rounded-md mt-4 md:mt-8 transition-all duration-700 ease-out delay-200 ${
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          } hover:scale-105 brightness-110 duration-300`}
        >
          <img src="/donation.jpg" className="w-full h-full object-cover rounded-md" />
        </div>

        <div
          className={`bg-contimg w-full md:w-[23%] h-auto md:h-[700px] mx-2 rounded-md mt-4 md:mt-24 transition-all duration-700 ease-out delay-300 ${
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          } hover:scale-105 duration-300`}
        >
          <p className="py-12 px-6 font-semibold text-black text-[18px] tracking-wide leading-relaxed text-justify">
            By extending the life cycle of goods, TBR3 actively supports green computing principles, minimising environmental impact, conserving resources, and encouraging eco-conscious behaviour.
            <br /><br />
            The platform also aligns deeply with Islamic values such as charity, avoiding waste, and stewardship of the Earth.
            <br /><br />
            TBR3 is more than just a donation platform, it's a movement that brings technology, faith, and environmental responsibility together to build a kinder, greener, and more giving society.
            <img src="/movingarabic.gif" className="h-56 px-28 pb-10 mx-auto" />
          </p>
        </div>
      </div>
    </div>
  );
};

const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    let increment = end > 100 ? Math.ceil(end / 50) : 1;
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(timer);
      }
      setDisplay(current);
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
};

const HomeStats = () => {
  const [stats, setStats] = useState({ posts: 0, users: 0 });
  useEffect(() => {
    fetch("/api/stats/counts")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => setStats({ posts: 0, users: 0 }));
  }, []);
  return (
    <div className="flex flex-col items-center my-10 w-full">
      <div className="flex flex-wrap justify-center gap-8 w-full">
        <div className="relative bg-gradient-to-br from-green-200 via-white to-green-100 rounded-2xl shadow-2xl px-12 py-10 flex flex-col items-center min-w-[240px] border-2 border-green-300 hover:scale-105 transition-transform duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-200 rounded-t-2xl animate-pulse"></div>
          <FaRegNewspaper className="text-6xl text-green-700 mb-3 drop-shadow-lg animate-spin-slow" />
          <div className="text-5xl font-extrabold text-green-900 mb-2">
            <AnimatedNumber value={stats.posts} />
          </div>
          <div className="text-xl text-green-800 font-semibold tracking-wide">عدد المنشورات</div>
        </div>
        <div className="relative bg-gradient-to-br from-blue-200 via-white to-blue-100 rounded-2xl shadow-2xl px-12 py-10 flex flex-col items-center min-w-[240px] border-2 border-blue-300 hover:scale-105 transition-transform duration-300 overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-blue-200 rounded-b-2xl animate-pulse"></div>
          <FaUsers className="text-6xl text-blue-700 mb-3 drop-shadow-lg animate-spin-slow-reverse" />
          <div className="text-5xl font-extrabold text-blue-900 mb-2">
            <AnimatedNumber value={stats.users} />
          </div>
          <div className="text-xl text-blue-800 font-semibold tracking-wide">عدد المستخدمين</div>
        </div>
      </div>
    </div>
  );
};

const Homepage = () => {
  const navigate = useNavigate();

  return (
    <section className="">
    <div className="min-h-screen bg-gray-100 text-[#065f46] font-sans">
      <section className="relative w-full h-[650px] overflow-hidden rounded-b-xl shadow-lg">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://media.tbr3.org/videos/waste.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </section>
      <HomeStats />
      <BarSection />
      <section className="relative w-full h-auto  overflow-hidden rounded-b-xl shadow-lg ">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover  mx-4"
        >
          <source src="https://media.tbr3.org/videos/home4.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video> </section>
    </div>
</section>
  );
};

export default Homepage;

// Tailwind custom animation (add to tailwind.config.js if not present):
// 'spin-slow': 'spin 3s linear infinite',
// 'spin-slow-reverse': 'spin 3s linear reverse infinite',

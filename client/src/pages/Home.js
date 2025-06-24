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
      <div className="flex flex-wrap justify-center md:justify-between w-full gap-4">
        {/* Container 1 */}
        <div
          className={`bg-[#0b5f7db2] w-full sm:w-[48%] md:w-[23%] h-auto md:h-[700px] rounded-md mt-4 transition-all duration-700 hover:shadow-xl ease-out ${
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          } hover:scale-105 duration-300`}
        >
          <img src="/1.gif" className="w-full h-full object-cover rounded-md" />
        </div>

        {/* Container 2 */}
        <div
          className={`bg-contimg w-full sm:w-[48%] md:w-[23%] h-auto md:h-[700px] rounded-md mt-4 transition-all duration-700 ease-out delay-100 ${
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          } hover:scale-105 duration-300`}
        >
          <p className="py-12 px-6 font-medium text-black text-[18px] tracking-wide leading-relaxed text-justify">
            <span className="font-semibold text-lg">TBR3</span> is a Jordanian-born platform inspired by the Arabic word{" "}
            <span className="font-serif font-bold">"تبَرّع"</span> meaning <span className="font-serif font-bold">"to donate"</span>.
            <br /><br />
            It allows people to share second-hand items instead of discarding them — reducing waste and offering support to those in need.
            <img src="/new.gif" className="w-[200px] h-auto mx-auto" />
          </p>
        </div>

        {/* Container 3 */}
        <div
          className={`bg-[#0b5e7d] w-full sm:w-[48%] md:w-[23%] h-auto md:h-[700px] rounded-md mt-4 transition-all duration-700 ease-out delay-200 ${
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          } hover:scale-105 brightness-110 duration-300`}
        >
          <img src="/donation.jpg" className="w-full h-full object-cover rounded-md" />
        </div>

        {/* Container 4 */}
        <div
          className={`bg-contimg w-full sm:w-[48%] md:w-[23%] h-auto md:h-[700px] rounded-md mt-4 transition-all duration-700 ease-out delay-300 ${
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          } hover:scale-105 duration-300`}
        >
          <p className="py-12 px-6 font-semibold text-black text-[18px] tracking-wide leading-relaxed text-justify">
            By extending the life cycle of goods, TBR3 supports green computing and aligns with Islamic values like charity and avoiding waste.
            <img src="/movingarabic.gif" className="h-56 px-28 pb-10 mx-auto mt-4" />
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
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = React.useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // مرة واحدة فقط
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      fetch("/api/stats/counts")
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(() => setStats({ posts: 0, users: 0 }));
    }
  }, [isVisible]);

  return (
    <div ref={sectionRef} className="flex flex-col items-center w-full ">
      {isVisible && (
        <div className="flex flex-wrap justify-center gap-14 w-full">
          {/* Posts */}
          <div className="relative bg-white rounded-full shadow-lg w-[190px] h-[190px] flex flex-col items-center justify-center border-4 border-green-700 hover:scale-105 transition-transform duration-300">
            <FaRegNewspaper className="text-5xl text-black mb-2" />
            <div className="text-3xl font-bold text-black">
              <AnimatedNumber value={stats.posts} />
            </div>
            <div className="text-base text-black font-semibold mt-1">Posts</div>
          </div>

          {/* Users */}
          <div className="relative bg-white rounded-full shadow-lg w-[190px] h-[190px] flex flex-col items-center justify-center border-4 border-green-700 hover:scale-105 transition-transform duration-300">
            <FaUsers className="text-5xl text-black mb-2" />
            <div className="text-3xl font-bold text-black">
              <AnimatedNumber value={stats.users} />
            </div>
            <div className="text-base text-black font-semibold mt-1">Users</div>
          </div>
        </div>
      )}
    </div>
  );
};


const Homepage = () => {
  const navigate = useNavigate();

  return (
    <section className="">
    <div className="min-h-screen bg-gray-100 text-[#065f46]">
      <section className="relative w-full aspect-video md:h-[650px] overflow-hidden rounded-b-xl shadow-lg">
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
     
      <BarSection />
       <section className="relative w-full h-auto bg-gray-100 overflow-hidden rounded-b-xl shadow-xl ">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover mx-4"
        >
          <source src="https://media.tbr3.org/videos/home4.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video> 
        </section> 

      <div className="bg-black pb-24 px-4 text-center pt-14 ">
  <p className="mb-10 text-white font-semibold text-lg sm:text-xl md:text-2xl lg:text-3xl leading-relaxed">
    <span className="text-3xl sm:text-4xl md:text-5xl text-green-500 block mb-4">Join a community of changemakers</span>
    Be the one who gives generously and lives sustainably.
    <br /><br />
    Support a proudly Jordanian platform making a real difference with TBR3.
  </p>
  <button className="bg-green-600 text-white px-10 py-3 rounded-full shadow-md hover:bg-green-700 hover:shadow-lg transition duration-300 mb-14 text-base sm:text-lg">
    GET STARTED
  </button>
  <HomeStats />
</div>

       
        
    </div>
</section>
  );
};

export default Homepage;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaRegNewspaper } from "react-icons/fa6";
import { MdEvent, MdEventAvailable } from "react-icons/md";

const BarSection = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div className="flex flex-col items-center w-full px-4 my-10"> 
      <div className="flex flex-wrap justify-center md:justify-between w-full gap-4">
   

        <div
          className={`bg-contimg w-full md:w-[23%] h-auto md:h-[700px] mx-2 rounded-md mt-4 md:mt-24 transition-all duration-700 ease-out delay-300 ${
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          } hover:scale-105 duration-300`}
        >
          <p className="py-12 px-6 font-medium text-black text-[18px] tracking-wide leading-relaxed text-right">
             تدعم مبادئ الحوسبة الخضراء بشكل فعّال مما يقلل من الأثر البيئي ويحافظ على الموارد و يشجع على السلوك البيئي الواعي <br></br><br></br>

             كما تتماشى المنصة بشكل عميق مع القيم الإسلامية مثل الصدقة وتجنب التبذير والحفاظ على الأرض <br></br> <br></br>تبرَّع ليست مجرد منصة , بل هي حركة تجمع بين التكنولوجيا والإيمان والمسؤولية البيئية لبناء مجتمع اكثر لطفا وخضرة وعطاء

            <img src="/new.gif" className="w-[200px] h-auto mx-auto" />
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
          <p className="py-12 px-6 font-semibold text-black text-[18px] tracking-wide leading-relaxed  text-right">
 منصة أردنية وُلِدت من الكلمة العربية "تَبَرّع" والتي تعكس مهمة قائمة على العطاء والاستدامة ورعاية المجتمع<br></br> <br></br>
وتتيح هذه المنصة للناس مشاركة الأغراض المستعملة بدلا من التخلص منها مما يقلل من النفايات ويوفر الدعم لمن هم في حاجة من خلال إطالة دورة حياة المنتجات <br></br><br></br>
<br></br><br></br>
            <img src="/movingarabic.gif" className="h-56 px-28 pb-10 mx-auto mt-4" />
          </p>
        </div>

        <div
          className={`bg-[#0b5f7db2] w-full md:w-[23%] h-auto md:h-[700px] mx-2 rounded-md mt-0 transition-all duration-700  hover : shadow-xl ease-out ${
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          } hover:scale-105 duration-300`}
        >
          <img src="/1.gif" className="w-full h-full object-cover rounded-md" />
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
  const [stats, setStats] = useState({ posts: 0, users: 0, totalEventsHosted:0 });
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
        .catch(() => setStats({ posts: 0, users: 0, totalEventsHosted:0 }));
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
            <div className="text-base text-black font-semibold mt-1">المنشورات</div>
          </div>

          {/* Users */}
          <div className="relative bg-white rounded-full shadow-lg w-[190px] h-[190px] flex flex-col items-center justify-center border-4 border-green-700 hover:scale-105 transition-transform duration-300">
            <FaUsers className="text-5xl text-black mb-2" />
            <div className="text-3xl font-bold text-black">
              <AnimatedNumber value={stats.users} />
            </div>
            <div className="text-base text-black font-semibold mt-1">المستخدمين</div>
          </div>
                    <div className="relative bg-white rounded-full shadow-lg w-[190px] h-[190px] flex flex-col items-center justify-center border-4 border-green-700 hover:scale-105 transition-transform duration-300">
                      <MdEventAvailable className="text-5xl text-black mb-2" />
            <div className="text-3xl font-bold text-black">
              <AnimatedNumber value={stats.totalEventsHosted} />
            </div>
            <div className="text-base text-black font-semibold mt-1">الفعاليات</div>
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
    <div className="min-h-screen bg-gray-100 text-[#065f46] ">
      <section className="relative w-full aspect-video md:h-[650px] overflow-hidden rounded-b-xl shadow-lg">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://media.tbr3.org/videos/home2arabic.mp4" type="video/mp4" />
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
          <source src="https://media.tbr3.org/videos/homearabic.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video> 
        </section> 

      <div className="bg-black pb-24 px-4 text-center pt-14 ">
  <p className="mb-10 text-white font-semibold text-lg sm:text-xl md:text-2xl lg:text-3xl leading-relaxed">
    <span className="text-3xl sm:text-4xl md:text-5xl text-green-500 block mb-7" >  !إنضم إلى مجتمع من صانعي التغيير   
    </span>
كن من يمنح بسخاء ويعيش بأسلوب مستدام
    <br /><br />
إدعم منصة أردنية بفخر وأحدث فرقًا حقيقيًا مع تبرَّع

  </p>
  <button className="bg-green-600 text-white px-10 py-3 rounded-full shadow-md hover:bg-green-700 hover:shadow-lg transition duration-300 mb-14 text-base sm:text-lg">
    ابدأ الآن
  </button>
  <HomeStats />
</div>

       
        
    </div>
</section>
  );
};

export default Homepage;


import React from "react";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-100 text-[#065f46] font-sans">

      <section className="relative w-full h-[500px] overflow-hidden rounded-b-xl shadow-lg">
        <img
          src="/images/banner2.gif"
          alt="background donation"
          className="w-full h-full object-cover backdrop-blur-sm"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Be influential and donate
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl">
            Help those in need and be Eco-friendly
          </p>
          <button
            onClick={() => navigate("/feed")}
           className="bg-green-600 hover:bg-[#34d399] text-white font-bold py-3 px-8 rounded-full text-lg transition shadow-lg"
          >
           View more!
          </button>

        </div>
      </section>

      <div className="w-full mx-auto flex flex-col md:flex-row gap-8">
        <section className="flex flex-col md:flex-row items-center bg-green-600 p-10 mt-20 shadow-lg gap-10">
          <div className="md:w-1/2">
            <h2 className="text-4xl font-medium text-white mb-4 text-center md:text-left">our perspective..</h2>
            <p className="text-lg text-white leading-loose text-center md:text-left">
              TBR3 is a Jordanian-born platform inspired by the Arabic word "تبَرّع" meaning "to donate" 
              reflecting a mission rooted in giving, sustainability, and community care. 
              It allows people to share second-hand items instead of discarding them,
              reducing waste and offering support to those in need.<br /><br />
              By extending the life cycle of goods, 
              TBR3 actively supports green computing principles, minimising environmental impact, conserving resources,
              and encouraging eco-conscious behaviour. The platform also aligns deeply with Islamic values such as charity,
              avoiding waste, and stewardship of the Earth. <br /><br />
              TBR3 is more than just a donation platform, it's a movement that brings 
              technology, faith, and environmental responsibility together to build a kinder, greener, and more giving society.
            </p>
          </div>
          <div className="md:w-1/2">
            <img src="/images/donation.jpg" alt="donation" className="rounded-lg shadow-lg w-full h-[500px] object-cover" />
          </div>
        </section>
      </div>

      <section className="flex flex-col md:flex-row items-center bg-[#093965] p-10 mt-20 shadow-lg mb-10 gap-10">
        <div className="md:w-1/2">
          <img src="/images/list.jpg" alt="Who we are" className="shadow-lg w-full h-[400px] object-cover rounded-lg" />
        </div>
        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold text-[#10b981] mb-2 text-center md:text-left">
            what can you donate?
          </h2>
          <p className="text-lg text-white leading-loose text-center md:text-left whitespace-pre-line">
            Items
            Clothing – gently used or new clothes, shoes, coats.<br></br>

            Furniture – beds, sofas, tables, etc.<br></br>

            Electronics – phones, laptops, tablets (in working condition).<br></br>

            Books and Toys – for children or general community use.<br></br>

            Household items – kitchenware, linens, appliances.<br></br>
          </p>
        </div>
      </section>

    </div>
  );
};

export default Homepage;

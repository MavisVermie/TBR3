import React from "react";
import { Link } from "react-router-dom";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-[#065f46] font-sans">
      {/* Banner Section */}
      <section className="relative w-full h-[500px] overflow-hidden rounded-b-2xl shadow-lg group">
        <img
          src="/images/banner2.gif"
          alt="background donation"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Be influential and donate
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-8 max-w-2xl">
            Help those in need and be Eco-friendly
          </p>
       
          <Link to="/feed">
            <button className="bg-green-600 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-full text-lg transition shadow-lg">
              Donate now
            </button>
          </Link>
        </div>
      </section>


      {/* Perspective Section */}
      <div className="container px-2 w-full sm:px-6 lg:px-8">
        <section className="transition-transform duration-300 hover:scale-[1.02] flex flex-col md:flex-row items-center bg-green-600 p-6 sm:p-8 md:p-10 mt-10 md:mt-20 shadow-lg gap-10 rounded-lg">
          <div className="md:w-1/2">
            <h2 className="text-3xl sm:text-4xl font-medium text-white mb-4 text-center md:text-left">
              OUR PRESPECTIVE..
            </h2>
            <p className="text-base sm:text-lg text-white leading-loose text-center md:text-left">
              TBR3 is a Jordanian-born platform inspired by the Arabic word{" "}
              <span className="tracking-widest">"تبَرّع"</span> meaning "to donate" reflecting a mission rooted in giving, sustainability, and community care.
              It allows people to share second-hand items instead of discarding them,
              reducing waste and offering support to those in need.
              <br /><br />
              By extending the life cycle of goods, TBR3 actively supports green computing principles,
              minimising environmental impact, conserving resources, and encouraging eco-conscious behaviour.
              The platform also aligns deeply with Islamic values such as charity,
              avoiding waste, and stewardship of the Earth.
              <br /><br />
              TBR3 is more than just a donation platform, it's a movement that brings 
              technology, faith, and environmental responsibility together to build a kinder, greener, and more giving society.
            </p>
          </div>
          <div className="md:w-1/2">
            <img
              src="/images/donation.jpg"
              alt="donation"
              className="rounded-lg shadow-lg w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover"
            />
          </div>
        </section>
      </div>

      {/* Donation Types Section */}
      <div className="container mx-auto px-4 w-full sm:px-6 lg:px-8">
        <section className="transition-transform duration-300 hover:scale-[1.02] flex flex-col md:flex-row items-center bg-gray-800 p-6 sm:p-8 md:p-10 mt-10 md:mt-20 mb-10 shadow-lg gap-10 rounded-lg">
          <div className="md:w-1/2">
            <img
              src="/images/list.jpg"
              alt="Who we are"
              className="shadow-lg w-full h-[250px] sm:h-[350px] md:h-[400px] object-cover rounded-lg"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl sm:text-4xl font-bold text-green-500 mb-4 text-center md:text-left">
              WHAT CAN YOU DONATE?
            </h2>
            <p className="text-base sm:text-lg text-white leading-loose text-center md:text-left whitespace-pre-line">
              1- Clothing – gently used or new clothes, shoes, coats.{"\n"}{"\n"}
              2- Furniture – beds, sofas, tables, etc.{"\n"}{"\n"}
              3- Electronics – phones, laptops, tablets (in working condition).{"\n"}{"\n"}
              4- Books and Toys – for children or general community use.{"\n"}{"\n"}
              5- Household items – kitchenware, linens, appliances.{"\n"}{"\n"}
              AND MANY MORE..
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Homepage;

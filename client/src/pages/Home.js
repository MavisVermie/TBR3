import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Homepage = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has a preferred theme saved in localStorage
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    // Save the preference to localStorage
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Toggle dark mode state
  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return (
    <div className={`${isDarkMode ? "dark" : ""} min-h-screen font-sans`}>
      {/* Dark mode styles wrapper */}
      <div className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-green-400" : "bg-gray-100 text-[#065f46]"}`}>
        {/* Dark mode toggle button */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={toggleDarkMode}
            className="bg-green-600 hover:bg-green-800 text-white px-4 py-2 rounded shadow"
          >
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

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
          <section className={`transition-transform duration-300 hover:scale-[1.02] flex flex-col md:flex-row items-center p-6 sm:p-8 md:p-10 mt-10 md:mt-20 shadow-lg gap-10 rounded-lg
            ${isDarkMode ? "bg-green-900" : "bg-green-600"}`}>
            <div className="md:w-1/2">
              <h2 className={`text-3xl sm:text-4xl font-medium mb-4 text-center md:text-left
                ${isDarkMode ? "text-green-300" : "text-white"}`}>
                OUR PRESPECTIVE..
              </h2>
              <p className={`text-base sm:text-lg leading-loose text-center md:text-left
                ${isDarkMode ? "text-green-200" : "text-white"}`}>
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
          <section className={`transition-transform duration-300 hover:scale-[1.02] flex flex-col md:flex-row items-center p-6 sm:p-8 md:p-10 mt-10 md:mt-20 mb-10 shadow-lg gap-10 rounded-lg
            ${isDarkMode ? "bg-gray-800" : "bg-gray-800"}`}>
            <div className="md:w-1/2">
              <img
                src="/images/list.jpg"
                alt="Who we are"
                className="shadow-lg w-full h-[250px] sm:h-[350px] md:h-[400px] object-cover rounded-lg"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className={`text-3xl sm:text-4xl font-bold mb-4 text-center md:text-left
                ${isDarkMode ? "text-green-400" : "text-green-500"}`}>
                WHAT CAN YOU DONATE?
              </h2>
              <p className={`text-base sm:text-lg leading-loose text-center md:text-left whitespace-pre-line
                ${isDarkMode ? "text-green-200" : "text-white"}`}>
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
    </div>
  );
};

export default Homepage;

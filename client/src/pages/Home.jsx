import React from "react";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-[#f3fffb] text-[#065f46] font-sans">

      <section className="relative w-full h-[500px] overflow-hidden rounded-b-3xl shadow-lg">
        <img
          src="/images/banner2.gif"
          alt="background donation"
          className="w-full h-full object-cover backdrop-blur-sm"
        />
        <div className="absolute inset-0 bg- bg-opacity-40 flex flex-col justify-center items-center text-white text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Be influential and donate
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl">
            Help those in need and be Eco-friendly
          </p>
          <button className="bg-[#10b981] hover:bg-[#34d399] text-white font-bold py-3 px-8 rounded-full text-lg transition shadow-lg">
        Donate now
          </button>
        </div>
      </section>

      <section className="flex flex-col md:flex-row items-center bg-[#e0fff2] p-10 mt-20 rounded-3xl shadow-lg mx-4 gap-10">
        <div className="md:w-1/2">
          <img src="/images/ddd1.jpg" alt="أهمية التبرع" className="rounded-3xl shadow-lg w-full h-[400px] object-cover" />
        </div>
        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold text-[#10b981] mb-4 text-center md:text-left">The importance of reuse</h2>
          <p className="text-lg text-[#065f46] leading-relaxed text-center md:text-left">

Reusing is important not only because it saves resources and protects the environment, but also because it helps spread kindness among people. When we reuse items we no longer need and donate them, we give those things a new chance to benefit others instead of throwing them away as waste. This act strengthens the spirit of giving and solidarity in the community and supports those in need of items we might consider simple. In doing so, we contribute to building a more cooperative society and preserving a clean and healthy planet for future generations.

          </p>
        </div>
      </section>

      <section className="flex flex-col md:flex-row-reverse items-center bg-[#dffef3] p-10 mt-20 rounded-3xl shadow-lg mx-4 mb-10 gap-10">
        <div className="md:w-1/2">
          <img src="/images/uni.jpg" alt="Who we are" className="rounded-3xl shadow-lg w-full h-[400px] object-cover" />
        </div>
        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold text-[#10b981] mb-4 text-center md:text-left">Who we are?</h2>
          <p className="text-lg text-[#065f46] leading-relaxed text-center md:text-left">
             We are six students from the College of Technology at Al al-Bayt University, from different majors but united by one goal: to help people and protect our environment. We created a website to encourage recycling and donating items we no longer need, giving them a new chance to benefit others and keep the Earth clean. We believe every small action makes a big difference, and we work together to make a real impact.


          </p>
        </div>
      </section>

    </div>
  );
};

export default Homepage;

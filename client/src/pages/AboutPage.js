import React, { useState } from 'react';
import '../index.css';
import freecyclelogo from '../assets/logo2.png'

const people = [
   {
    name: 'Rama',
    role: 'The best girl ever',
    imageUrl:
      '',
  },
  {
    name: 'Mavis',
    role: 'Scrum Master, Full Stack Developer',
    imageUrl:
      '',
  },
  {
    name: 'Mavis',
    role: 'Product Manager, Full Stack Developer',
    imageUrl:
      ''
  },
  {
    name: 'Mavis',
    role: 'The best at everything',
    imageUrl:
      '',
  },
  {
    name: 'Mavis',
    role: 'The most important person',
    imageUrl:
      '',
  },
  {
    name: 'Mavis',
    role: 'The best person ever',
    imageUrl:
      '',
  },
  {
    name: 'Marah Yousef',
    role: 'Front End Developer',
    imageUrl:
      '',
  },
  {
    name: 'Manar Abuirshaaiad',
    role: 'Front End Developer',
    imageUrl:
      'https://i.imgur.com/x424cdS.png',
  },
  {
    name: 'Bashar Shqoor',
    role: 'Back End Developer',
    imageUrl:
      '',
  },
  // More people...
]

export default function AboutPage() {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    const mailto = `mailto:team@freecycle.com?subject=Message from Website Visitor&body=${encodeURIComponent(message)}`;
    window.location.href = mailto;
  };
  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <h2 className="text-4xl font-extrabold text-green-600">Meet our Team</h2>
          <p className="mt-4 text-lg text-green-600 font-medium">Software Engineer Roles</p>
        </div>
        <div className="flex flex-wrap justify-center gap-10 pb-16">
          {people.map((person, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-center">
              {/* Uncomment below if images are available*/
              <img src={person.imageUrl} alt={person.name} className="h-32 w-32 rounded-full mx-auto"/> }
              <h3 className="mt-4 text-xl font-semibold text-gray-900">{person.name}</h3>
              <p className="text-green-600">{person.role}</p>
            </div>
          ))}
        </div>
        <section className="bg-green-50 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl font-extrabold text-green-600">About Us</h2>
              <p className="mt-4 text-lg leading-7 text-gray-600">
                The best website ever by MAVIS.
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <img src={freecyclelogo} alt="About Us" className="h-48 object-contain"/>
            </div>
          </div>
        </section>
     {/* Contact Section */}
     <div className="flex justify-center items-center flex-col py-16">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-2xl text-center font-semibold text-green-600 mb-4">Contact the Team</h3>
            <textarea
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="4"
              placeholder="Your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <button
              onClick={handleSendMessage}
              className="mt-4 w-full bg-green-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-green-700"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
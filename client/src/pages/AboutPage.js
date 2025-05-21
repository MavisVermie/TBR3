import React, { useState } from 'react';
import '../index.css';
import tbr3logo from '../assets/tbr3.png';

const people = [
  {
    name: 'محمد المجالي',
    role: 'مطور الواجهة الخلفية',
    linkedinUrl: 'https://linkedin.com/in/mavisverm',
  },
  {
    name: 'مرح القنبر',
    role: 'مطور الواجهة الأمامية والتصميم',
    linkedinUrl: 'https://www.linkedin.com/in/marahyousef',
  },
  {
    name: 'منار أبو إرشيد',
    role: 'مطور الواجهة الأمامية',
    linkedinUrl: 'https://www.linkedin.com/in/manar-abu-irsheid-06b352325',
  },
  {
    name: 'راما العودات',
    role: 'مطور الواجهة الخلفية',
    linkedinUrl: 'https://www.linkedin.com/in/rama-alodat-686aa932a/',
  },
  {
    name: 'بشار شقور',
    role: 'مطور الواجهة الخلفية',
    linkedinUrl: 'https://www.linkedin.com/in/bashar-shaqour-320b922a7/',
  },
  {
    name: 'محمد البزور',
    role: 'مطور الواجهة الأمامية',
    linkedinUrl: 'https://www.linkedin.com/in/mohammed-al-bzoor-774b12329/',
  },
];

export default function AboutPage() {
  const [message, setMessage] = useState('');

  return (
    <div className="bg-gray-100 min-h-screen py-16 px-4">
      {/* Team Section */}
      <section className="max-w-6xl mx-auto mb-20">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-semibold text-red-700">تعرف على فريقنا</h1>
          <p className="mt-2 text-grey-600 text-lg">العقول الشغوفة وراء TBR3</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {people.map((person, index) => (
            <div
              key={index}
              className="group bg-white  rounded-xl shadow-md p-6 flex flex-col items-center text-center transform transition duration-500 ease hover:bg-green-700 hover:shadow-lg hover:scale-105"
            >
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-white">{person.name}</h3>
              <p className="text-green-700 mt-2 text-sm group-hover:text-gray-200 ">{person.role}</p>
              <a
                href={person.linkedinUrl}
                target="_blank"
                className="mt-4 text-green-600 group-hover:text-zinc-400 transition"
              >
                {/* LinkedIn SVG icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.23 0zM7.06 20.45H3.56V9h3.5v11.45zM5.31 7.42a2.02 2.02 0 1 1 0-4.04 2.02 2.02 0 0 1 0 4.04zM20.45 20.45h-3.5v-5.8c0-1.38-.02-3.16-1.93-3.16-1.94 0-2.24 1.51-2.24 3.06v5.9h-3.5V9h3.36v1.56h.05c.47-.89 1.62-1.83 3.34-1.83 3.57 0 4.23 2.35 4.23 5.41v6.31z" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="bg-red-900 w-full py-12 px-6 mb-20 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <div>
            <h1 className="text-4xl font-bold text-white">من نحن</h1>
            <p className="mt-4 text-zinc-100 text-lg leading-relaxed">
              نحن فريق من ستة طلاب من كلية تكنولوجيا المعلومات في جامعة آل البيت. متحدون بشغفنا وتفانينا، قمنا بإنشاء هذا الموقع الذي يركز على الحوسبة الخضراء. باستخدام مهاراتنا في البرمجة والتطوير، نسعى لتقديم تجربة استثنائية وسهلة الاستخدام.
            </p>
          </div>
          <div className="flex justify-center  md:justify-center ">
            <img src={tbr3logo} alt="tbr3 Logo" className="h-56 object-contain" />
          </div>
        </div>
      </section>

    </div>
  );
}

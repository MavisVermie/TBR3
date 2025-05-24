import React from 'react';

const ProfileInfo = ({ userInfo }) => {
  const {
    username = '',
    email = '',
    phone_number = 'Not provided',
    location = 'Not specified',
    rating,
    active_posts
  } = userInfo || {};

  const formattedRating =
    typeof rating === 'number' && rating > 0
      ? `${rating.toFixed(1)} / 5`
      : 'No rating yet';

  const starColor =
    rating >= 4.5
      ? 'text-yellow-400'
      : rating >= 3
      ? 'text-yellow-300'
      : rating > 0
      ? 'text-yellow-200'
      : 'text-gray-400';

  const detailItems = [
    {
      label: "Email",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      ),
      text: email
    },
    {
      label: "Phone Number",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      ),
      text: phone_number
    },
    
    {
      label: "Rating",
      icon: (
        <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.784 1.4 8.173L12 18.896l-7.334 3.852 1.4-8.173L.132 9.21l8.2-1.192z" />
      ),
      text: formattedRating,
      color: starColor
    },
    {
      label: "Active Posts",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      ),
      text: typeof active_posts === 'number' ? active_posts : 0
    }
  ];

  return (
    <section className="bg-gray-100 min-h-screen py-10 px-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-8 transition-shadow duration-300 hover:shadow-2xl space-y-10 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center space-x-6 animate-fade-in-up">
          <div className="h-24 w-24 rounded-full bg-green-600 flex items-center justify-center shadow-md scale-100 hover:scale-105 transition-transform duration-300">
            <span className="text-3xl font-bold text-white">
              {username[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">{username}</h1>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {detailItems.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition duration-300 transform hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-sm font-medium text-gray-500 mb-2">{item.label}</h3>
              <p className="text-lg text-gray-900 flex items-center">
                <svg
                  className={`w-5 h-5 mr-2 ${item.color || 'text-green-600'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {item.icon}
                </svg>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProfileInfo;

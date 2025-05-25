import React from 'react';
import { Link } from 'react-router-dom';
import { mockEvents } from '../data/mockEvents';
import EventCard from '../components/events/EventCard';

const Events = () => {
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-4xl font-semibold text-green-700"><span className='text-red-700'>Upcoming</span> Events</h1>
        <Link
          to="/create-event"
          className="bg-green-600 text-white px-5 py-2 rounded-full shadow hover:bg-green-700 transition duration-200"
        >
          + Create New Event
        </Link>
      </div>

      {/* Info Box */}
      <div className="bg-white bg-opacity-70 border-l-4 border-green-600 text-green-800 px-6 py-4 text-2xl shadow-md  mb-8 mx-0">
        <p className="text-base">
          Want to organize a new event? You can{' '}
          <Link to="/about" className="text-red-700 hover:underline font-semibold">
            contact us here
          </Link>{' '}
          to get started.
        </p>
      </div>

      {/* Event Grid or Empty State */}
      {mockEvents.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No events available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {mockEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;

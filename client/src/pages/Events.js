<<<<<<< Updated upstream
/**
 * Backend Requirements:
 * 
 * 1. API Endpoint: GET /api/events
 *    - Required Headers:
 *      * Authorization: Bearer token
 * 
 * 2. Query Parameters (optional):
 *    - page: number (default: 1)
 *    - limit: number (default: 10)
 *    - search: string (search in title and description)
 *    - sort: string (created_at, title)
 *    - order: string (asc, desc)
 * 
 * 3. Response:
 *    - Success (200):
 *      {
 *        events: [
 *          {
 *            id: number,
 *            title: string,
 *            description: string,
 *            location: string,
 *            owner_name: string,
 *            images: string[],
 *            created_at: string
 *          }
 *        ],
 *        pagination: {
 *          total: number,
 *          page: number,
 *          limit: number,
 *          total_pages: number
 *        }
 *      }
 *    - Error (401/500):
 *      {
 *        message: string
 *      }
 * 
 * 4. Database Queries:
 *    - SELECT events.*, 
 *           (SELECT image_url FROM event_images WHERE event_id = events.id LIMIT 1) as first_image
 *      FROM events
 *      ORDER BY created_at DESC
 *      LIMIT ? OFFSET ?
 * 
 *    - SELECT COUNT(*) as total FROM events
 */

import React from 'react';
=======
import React, { useEffect, useState } from 'react';
>>>>>>> Stashed changes
import { Link } from 'react-router-dom';
import EventCard from '../components/events/EventCard';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:5000/events');
        const data = await res.json();

        const formatted = data.map((event) => ({
          ...event,
          images: event.images.map(img => `data:image/jpeg;base64,${img}`)
        }));

        setEvents(formatted);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
<<<<<<< Updated upstream
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Events</h1>
=======
    <div className="container mx-auto px-4 py-8 bg-gray-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-4xl font-semibold text-green-700">
          <span className="text-red-700">Upcoming</span> Events
        </h1>
>>>>>>> Stashed changes
        <Link
          to="/create-event"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Event
        </Link>
      </div>
<<<<<<< Updated upstream
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-blue-700">
          Want to create a new event? You can
          <Link to="/create-event" className="text-blue-600 hover:text-blue-800 font-semibold mx-1">
            create a new event
          </Link>
          directly through the form.
        </p>
      </div>

      {mockEvents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No events available at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockEvents.map((event) => (
=======

      {/* Info Box */}
      <div className="bg-white bg-opacity-70 border-l-4 border-green-600 text-green-800 px-6 py-4 text-2xl shadow-md mb-8 mx-0">
        <p className="text-base">
          Want to organize a new event? You can{' '}
          <Link to="/about" className="text-red-700 hover:underline font-semibold">
            contact us here
          </Link>{' '}
          to get started.
        </p>
      </div>

      {/* Loading / Empty / Events */}
      {loading ? (
        <div className="text-center py-16 text-gray-600 text-lg font-medium">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No events available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {events.map((event) => (
>>>>>>> Stashed changes
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Events; 
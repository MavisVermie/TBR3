import React from 'react';

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 transition-colors duration-500">
      <div className="bg-white/80 dark:bg-gray-800 shadow-xl rounded-lg p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6 text-green-700 dark:text-green-400">Contact Us</h1>

        <p className="mb-6 text-black dark:text-gray-300">
          We'd love to hear from you! Please fill out the form below and we'll get in touch with you shortly.
        </p>

        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-black dark:text-gray-300 mb-3">Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-black dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black dark:text-gray-300 mb-3">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-black dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-black dark:text-gray-300 mb-3">Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 resize-none mb-4 bg-white dark:bg-gray-700 text-black dark:text-gray-100"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}

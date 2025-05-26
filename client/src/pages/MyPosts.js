import React from 'react';
import UserPosts from '../components/ProfileStuff/UserPosts';

const MyPosts = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors duration-300">
          <div className="p-6">
            <UserPosts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPosts;

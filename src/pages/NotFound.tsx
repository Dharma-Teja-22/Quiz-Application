import React from 'react';
import { Link } from 'react-router-dom'; // Assuming react-router for navigation

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-lightGrey text-black">
      <h1 className="text-6xl font-bold text-miracle-darkBlue mb-4">404</h1>
      <p className="text-2xl text-darkGrey mb-6">Oops! Page not found</p>
      
      <Link
        to="/"
        className="px-6 py-3 bg-lightBlue text-black font-semibold rounded-lg hover:bg-mediumBlue transition-colors"
      >
        Go back to Home
      </Link>
    </div>
  );
};

export default NotFound;

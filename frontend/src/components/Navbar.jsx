import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              💜 hearMe
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-indigo-600">Home</Link>
            <Link to="/chat" className="text-gray-700 hover:text-indigo-600">Chat</Link>
            <Link to="/volunteer" className="text-gray-700 hover:text-indigo-600">Volunteer</Link>
            <Link to="/resources" className="text-gray-700 hover:text-indigo-600">Resources</Link>
            <Link to="/about" className="text-gray-700 hover:text-indigo-600">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-indigo-600">Contact</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

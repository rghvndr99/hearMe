import React from 'react';

export default function Volunteer() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Become a Volunteer</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">
            Join our community of trained volunteers who provide peer support to those in need.
          </p>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
            Apply to Volunteer
          </button>
        </div>
      </div>
    </div>
  );
}

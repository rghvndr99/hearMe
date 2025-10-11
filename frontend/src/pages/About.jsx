import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">About hearMe</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">
            hearMe is a platform that provides anonymous, peer-to-peer mental health support. 
            Our mission is to create a safe space where people can share their feelings and 
            receive compassionate listening from trained volunteers.
          </p>
          <p className="text-gray-600">
            We believe that sometimes all someone needs is to be heard, understood, and 
            supported without judgment.
          </p>
        </div>
      </div>
    </div>
  );
}

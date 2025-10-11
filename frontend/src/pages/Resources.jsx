import React from 'react';

export default function Resources() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mental Health Resources</h1>
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-3">Crisis Hotlines</h2>
            <ul className="space-y-2 text-gray-600">
              <li>National Suicide Prevention Lifeline: 988</li>
              <li>Crisis Text Line: Text HOME to 741741</li>
              <li>SAMHSA National Helpline: 1-800-662-4357</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-3">Professional Help</h2>
            <p className="text-gray-600">
              Find licensed therapists and mental health professionals in your area.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

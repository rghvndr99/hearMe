import React from 'react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">
            Have questions or feedback? We'd love to hear from you.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input 
                type="email" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea 
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Your message..."
              />
            </div>
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

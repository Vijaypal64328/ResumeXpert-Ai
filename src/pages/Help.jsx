import React from 'react';

const Help = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Help Center</h2>
      <p className="mb-2">Need assistance? Our support team is here to help you:</p>
      <ul className="list-disc list-inside mb-4">
        <li>Email: support@resumexpert.com</li>
        <li>Phone: +1 (800) 123-4567</li>
        <li>Live Chat: Available 9am–5pm EST</li>
      </ul>
      <p>For frequently asked questions, please visit our <a href="#" className="text-blue-600 underline">FAQ page</a>.</p>
    </div>
  );
};

export default Help;

import React from 'react';

const ExplorePage = () => {
  return (
    <div className="flex flex-wrap gap-5 justify-center p-5 bg-gray-100">
      {[1, 2, 3, 4].map((course) => (
        <div
          key={course}
          className="bg-white rounded-lg shadow-md overflow-hidden w-72 transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg"
        >
          <img
            src={`https://via.placeholder.com/300x200?text=Course+${course}`}
            alt={`Course ${course}`}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="text-lg font-bold mb-2">Course Title {course}</h3>
            <p className="text-sm text-gray-600 mb-4">
              This is a brief description of the course. Learn more about the content and benefits.
            </p>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Duration: 10h</span>
              <span>Level: Beginner</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExplorePage;
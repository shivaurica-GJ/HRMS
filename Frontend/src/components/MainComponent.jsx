import React, { useState, Suspense } from 'react';

export default function MainComponent({ Sidebar, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex bg-gray-50 min-h-screen text-gray-900 relative">
      {/* Mobile sidebar overlay */}
      <div
        className={
          "fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity duration-300 " +
          (sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible")
        }
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar */}
      <Suspense fallback={<div>Loading Sidebar...</div>}>
        <Sidebar sidebarOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      </Suspense>

      {/* Main content */}
      <div className="flex-1 p-6 md:ml-64 z-20">
        {/* Mobile menu button */}
        <button
          className="md:hidden mb-4 p-2 rounded focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {/* Hamburger icon */}
          <svg
            className="h-6 w-6 text-gray-700"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

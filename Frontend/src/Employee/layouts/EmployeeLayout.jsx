// src/layouts/EmployeeLayout.js
import React, { lazy, Suspense, useCallback } from 'react';
import { Outlet } from 'react-router-dom';

const Sidebar = lazy(() => import('../components/Sidebar'));

const preloadSidebar = () => {
  import('../components/Sidebar');
};

export default function EmployeeLayout() {
  const handleMouseEnter = useCallback(() => {
    preloadSidebar();
  }, []);

  return (
    <div className="flex min-h-screen" onMouseEnter={handleMouseEnter}>
      <Suspense fallback={<div>Loading Sidebar...</div>}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 ml-64 bg-gray-50 min-h-screen p-6">
        <Outlet />
      </main>
    </div>
  );
}

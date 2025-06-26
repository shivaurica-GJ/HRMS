// src/Employee/EmployeeRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import EmployeeLayout from './layouts/EmployeeLayout';
import Dashboard from './Pages/Dashboard';
import Reports from './Pages/ReportsPage';
import Profile from './Pages/ProfilePage';

export default function EmployeeRoutes() {
  return (
    <Routes>
      <Route element={<EmployeeLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} />
        <Route index element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
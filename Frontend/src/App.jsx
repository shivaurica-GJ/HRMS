// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminRoutes from './Admin/AdminRoutes.jsx';
import HrRoutes from './HR/HrRoutes.jsx';
import EmployeeRoutes from './Employee/EmployeeRoutes.jsx';
import Login from './auth/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminRoutes />
          </ProtectedRoute>
        } />
        
        <Route path="/hr/*" element={
          <ProtectedRoute allowedRoles={['hr']}>
            <HrRoutes />
          </ProtectedRoute>
        } />
        
        <Route path="/employee/*" element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeRoutes />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
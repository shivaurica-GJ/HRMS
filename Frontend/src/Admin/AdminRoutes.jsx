// src/AdminRoutes.jsx
import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { isAdminLoggedIn } from "../utils/auth";
import Dashboard from "./Pages/Dashboard";
import ReportEmployeeList from "./Pages/ReportEmployeeList";
import EmployeeManagementPage from "./Pages/ReportManagementPage.jsx";
import Attendence from "./Pages/Attendance.jsx";
import LeavePage from "./Pages/LeavePage.jsx";
import PayrollPage from './Pages/PayrollPage.jsx';
import ProfilePage from './Pages/ProfilePage.jsx';
import EmployeeList from "./Pages/EmployeeList.jsx";
import EmployeeManage from "./Pages/EmployeeManage.jsx";
import MainComponent from "../components/MainComponent";

const Sidebar = lazy(() => import("./components/Sidebar"));
const Calendar = lazy(() => import('./Pages/Calendar'));

const AdminRoutes = () => {
  if (!isAdminLoggedIn()) return <Navigate to="/" replace />;

  return (
    <MainComponent Sidebar={Sidebar}>
      <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="reports" element={<ReportEmployeeList />} />
          <Route path="reports/manage/:id" element={<EmployeeManagementPage />} />
          <Route path="employee" element={<EmployeeList />} />
          <Route path="employee/manage/:id" element={<EmployeeManage />} />
          <Route path="attendance" element={<Attendence />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="leave" element={<LeavePage />} />
          <Route path="payroll" element={<PayrollPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Routes>
      </Suspense>
    </MainComponent>
  );
};

export default AdminRoutes;
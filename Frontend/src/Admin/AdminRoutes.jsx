import React, { lazy, Suspense, useCallback } from "react";
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

// Preload function to load Sidebar component on demand
const preloadSidebar = () => {
  import("./components/Sidebar");
};

const AdminRoutes = () => {
  if (!isAdminLoggedIn()) return <Navigate to="/" replace />;

  // useCallback to memoize the preload function
  const handleMouseEnter = useCallback(() => {
    preloadSidebar();
  }, []);

  return (
    <Suspense fallback={<div>Loading Sidebar...</div>}>
      <div onMouseEnter={handleMouseEnter}>
        <MainComponent Sidebar={Sidebar}>
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="reports" element={<ReportEmployeeList />} />
            <Route path="reports/manage/:id" element={<EmployeeManagementPage />} />
            <Route path="employee" element={<EmployeeList />} />
            <Route path="employee/manage/:id" element={<EmployeeManage />} />
            <Route path="attendance" element={<Attendence />} />
            <Route path="leave" element={<LeavePage />} />
            <Route path="payroll" element={<PayrollPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Routes>
        </MainComponent>
      </div>
    </Suspense>
  );
};

export default AdminRoutes;

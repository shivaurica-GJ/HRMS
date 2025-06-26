// src/Pages/EmployeeManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Calendar,
  User,
  Mail,
  ChevronDown,
  Briefcase,
  HeartPulse,
  Coffee,
  FileText,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

const EmployeeManagementPage = () => {
  const { id } = useParams();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize selectedMonth with current month
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${year}-${month}`);
  }, []);

  // Fetch employee profile data
  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/employee/${id}`, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch employee profile');
        }
        
        const data = await response.json();
        setEmployeeData(data);
      } catch (err) {
        console.error('Error fetching employee profile:', err);
        setError(err.message || 'Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeProfile();
  }, [id]);

  // Fetch attendance data when month changes
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!id || !selectedMonth) return;
      
      try {
        setAttendanceLoading(true);
        const [year, month] = selectedMonth.split('-');
        
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/attendance/${id}?month=${month}&year=${year}`, 
          {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem("token")}` 
            }
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch attendance data');
        }
        
        const data = await response.json();
        setAttendance(data);
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError(err.message || 'Failed to load attendance data');
      } finally {
        setAttendanceLoading(false);
      }
    };

    if (employeeData && selectedMonth) {
      fetchAttendance();
    }
  }, [id, selectedMonth, employeeData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
          <p className="mt-4 text-lg text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="mt-4 text-xl font-medium text-gray-900">Error loading data</h3>
          <p className="mt-2 text-gray-600">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
            <Link 
              to="/admin/reports"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Employees
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!employeeData || !employeeData.profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gray-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto">
            <User className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="mt-4 text-xl font-medium text-gray-900">Employee not found</h3>
          <p className="mt-2 text-gray-600">The requested employee could not be found.</p>
          <Link 
            to="/admin/reports"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Employee List
          </Link>
        </div>
      </div>
    );
  }

  // Extract profile and stats from API response
  const { profile, stats } = employeeData;
  const { employee } = profile;
  
  // Generate month options for selector
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    const joinDate = new Date(profile.joinDate);
    
    // Start from join date or one year back
    const startDate = new Date(
      Math.max(
        joinDate.getFullYear() - 1, 
        currentDate.getFullYear() - 2
      ), 
      0, 
      1
    );
    
    for (let d = new Date(currentDate); d >= startDate; d.setMonth(d.getMonth() - 1)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const monthName = d.toLocaleString('default', { month: 'long' });
      options.push(
        <option key={`${year}-${month}`} value={`${year}-${month}`}>
          {monthName} {year}
        </option>
      );
    }
    
    return options;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <title>
        {profile.fullName} | Employee Management
      </title>
      
      {/* Header */}
      <header className="">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {profile.fullName}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Employee Report Details
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {generateMonthOptions()}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
              </div>
              <button 
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled
                title="Feature coming soon"
              >
                <Download className="h-5 w-5 mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          to="/admin/reports"
          className="mb-6 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Employee List
        </Link>
        
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-6 sm:px-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">              
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{profile.fullName}</h2>
                    <p className="text-gray-600">{profile.designation}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    profile.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {profile.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Join Date</p>
                      <p className="font-medium">
                        {new Date(profile.joinDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium break-all">{profile.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Aadhar Number</p>
                      <p className="font-medium">{employee?.aadharNumber || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Leave Balances */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Balances</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sick Leave */}
            {employee?.sickLeaves !== undefined && (
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-red-100 p-3 rounded-lg mr-4 flex-shrink-0">
                    <HeartPulse className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sick Leave</p>
                    <p className="text-2xl font-bold">
                      {employee.sickLeaves} days
                    </p>
                    {employee.resetYear && (
                      <p className="text-xs text-gray-500 mt-1">
                        Resets annually in {employee.resetYear}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Casual Leave */}
            {employee?.casualLeaves !== undefined && (
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4 flex-shrink-0">
                    <Coffee className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Casual Leave</p>
                    <p className="text-2xl font-bold">
                      {employee.casualLeaves} days
                    </p>
                    {employee.resetYear && (
                      <p className="text-xs text-gray-500 mt-1">
                        Resets annually in {employee.resetYear}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Leaves */}
        {stats?.recentLeaves?.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Leaves</h3>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentLeaves.map((leave, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {leave.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(leave.startDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(leave.endDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            leave.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Payroll Information - Only show if data exists */}
        {stats?.payroll && Object.keys(stats.payroll).length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Payroll Information
            </h3>
            
            <div className="bg-white shadow rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Earnings</p>
                  <p className="text-2xl font-bold">₹{stats.payroll.totalEarnings?.toLocaleString() || '0'}</p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Deductions</p>
                  <p className="text-2xl font-bold">₹{stats.payroll.totalDeductions?.toLocaleString() || '0'}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Last Payment Date</p>
                  <p className="text-xl font-bold">
                    {stats.payroll.lastPaymentDate ? 
                      new Date(stats.payroll.lastPaymentDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 
                      'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Attendance Log */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Attendance Log ({selectedMonth ? new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''})
            </h3>
            {attendanceLoading && (
              <div className="flex items-center text-sm text-gray-500">
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Loading attendance...
              </div>
            )}
          </div>
          
          {!attendanceLoading && attendance.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto" />
              <h4 className="mt-4 text-lg font-medium text-gray-900">No attendance records</h4>
              <p className="mt-2 text-gray-600">No attendance data available for the selected month.</p>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clock In
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clock Out
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Work Done
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendance.map((entry, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.clockIn || '--:--'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.clockOut || '--:--'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            entry.status === 'Present' ? 'bg-green-100 text-green-800' : 
                            entry.status === 'Late' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {entry.reason || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagementPage;
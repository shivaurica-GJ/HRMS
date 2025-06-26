import { useEffect, useState } from 'react';

export default function LeavePage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [activeFilters, setActiveFilters] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (type) queryParams.append('type', type.toLowerCase());
        if (status) queryParams.append('status', status.toLowerCase());

        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/leave?${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (res.ok) {
          setLeaveRequests(data.map(leave => ({
            id: leave._id,
            name: leave.user.fullName,
            email: leave.user.email,
            type: leave.type.charAt(0).toUpperCase() + leave.type.slice(1),
            status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1),
            start: leave.startDate,
            end: leave.endDate,
            reason: leave.reason || '',
            days: Math.floor((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1
          })));
        } else {
          alert(data.msg || "Failed to fetch leave requests");
        }
      } catch (err) {
        console.error("Error fetching leave requests:", err);
        alert("Server error");
      }
    };

    fetchLeaves();
  }, [type, status, token]);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/leave/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'approved' })
      });
      if (res.ok) {
        setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'Approved' } : req));
        closeDetails();
      } else {
        const data = await res.json();
        alert(data.msg || 'Approval failed');
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/leave/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'rejected' })
      });
      if (res.ok) {
        setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'Rejected' } : req));
        closeDetails();
      } else {
        const data = await res.json();
        alert(data.msg || 'Rejection failed');
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const filtered = leaveRequests.filter(req =>
    (req.name.toLowerCase().includes(search.toLowerCase()) ||
    req.email.toLowerCase().includes(search.toLowerCase()))
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      return `${startDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${endDate.getDate()}, ${endDate.getFullYear()}`;
    }
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const clearFilters = () => {
    setType('');
    setStatus('');
    setSearch('');
    setActiveFilters(false);
  };

  const openDetails = (request) => {
    setSelectedRequest(request);
  };

  const closeDetails = () => {
    setSelectedRequest(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <title>Leaves | HR</title>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Leave Management</h1>
        <p className="text-gray-500 mt-1">Review and manage employee leave requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="text-gray-500 text-sm">Total Requests</div>
          <div className="text-xl font-bold text-gray-800 mt-1">{leaveRequests.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="text-gray-500 text-sm">Pending</div>
          <div className="text-xl font-bold text-yellow-600 mt-1">
            {leaveRequests.filter(req => req.status === 'Pending').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="text-gray-500 text-sm">Approved</div>
          <div className="text-xl font-bold text-green-600 mt-1">
            {leaveRequests.filter(req => req.status === 'Approved').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="text-gray-500 text-sm">Rejected</div>
          <div className="text-xl font-bold text-red-600 mt-1">
            {leaveRequests.filter(req => req.status === 'Rejected').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
            <p className="text-gray-500 text-sm mt-1">
              {activeFilters ? 'Filters applied' : 'No filters applied'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative flex-1">
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setActiveFilters(true);
                }}
                className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 w-full"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={type}
                onChange={e => {
                  setType(e.target.value);
                  setActiveFilters(true);
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm w-full sm:w-auto"
              >
                <option value="">All Leave Types</option>
                <option value="Casual">Casual</option>
                <option value="Sick">Sick</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Maternity">Maternity</option>
                <option value="Paternity">Paternity</option>
              </select>
              
              <select
                value={status}
                onChange={e => {
                  setStatus(e.target.value);
                  setActiveFilters(true);
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm w-full sm:w-auto"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              
              {activeFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 w-full sm:w-auto justify-center"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length > 0 ? (
                filtered.map((req) => {
                  const statusColor = req.status === 'Approved'
                    ? 'bg-green-100 text-green-800'
                    : req.status === 'Rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800';
                  
                  return (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{req.name}</div>
                          <div className="text-xs text-gray-500">{req.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{req.type}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 whitespace-nowrap">
                          {formatDateRange(req.start, req.end)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{req.days} day(s)</div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="text-sm text-gray-900 truncate" title={req.reason}>
                          {req.reason}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => openDetails(req)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No leave requests found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                    <div className="mt-4">
                      <button 
                        onClick={clearFilters}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Leave Request Details</h2>
              <button 
                onClick={closeDetails}
                className="text-gray-400 hover:text-gray-500 rounded-full p-1 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Employee</h3>
                  <p className="mt-1 text-gray-900">{selectedRequest.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-gray-900">{selectedRequest.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Leave Type</h3>
                  <p className="mt-1 text-gray-900">{selectedRequest.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <span className={`mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                    selectedRequest.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    selectedRequest.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                  <p className="mt-1 text-gray-900">{formatDate(selectedRequest.start)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                  <p className="mt-1 text-gray-900">{formatDate(selectedRequest.end)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                  <p className="mt-1 text-gray-900">{selectedRequest.days} days</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Reason</h3>
                <p className="mt-1 text-gray-900 p-3 bg-gray-50 rounded-lg">
                  {selectedRequest.reason}
                </p>
              </div>
              
              {selectedRequest.status === 'Pending' && (
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => handleReject(selectedRequest.id)}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium cursor-pointer"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats footer */}
      <div className="mt-6 text-sm text-gray-500">
        Showing {filtered.length} of {leaveRequests.length} requests
      </div>
    </div>
  );
}
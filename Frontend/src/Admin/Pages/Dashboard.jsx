import { useEffect, useState } from "react";

export default function Dashboard() {
  const [dateTime, setDateTime] = useState(new Date());
  const [stats, setStats] = useState({ totalEmployees: 0, presentToday: 0, absentToday: 0 });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/admin/employees`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok) setEmployees(data);
        else alert(data.msg || "Failed to load employees");
      } catch (err) {
        console.error("Error fetching employees:", err);
        alert("Server error fetching employees");
      }
    };

    fetchEmployees();
  }, []);

  const totalEmployees = employees.length;

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setStats(data.stats);
          setRecentLeaves(data.recentLeaves);
          setTodayAttendance(data.todayAttendance);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLeaveStatusUpdate = async (leaveId, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard/leaves/${leaveId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (res.ok) {
        setRecentLeaves(data.recentLeaves);
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      console.error("Failed to update leave status", err);
      alert("Something went wrong!");
    }
  };

  const formattedDate = dateTime.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = dateTime.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="space-y-6">
      <title>Dashboard | Admin</title>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="text-sm text-gray-600 font-medium mt-2 sm:mt-0">
          <span>{formattedDate}</span> | <span>{formattedTime}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-500">Total Employees</p>
          <h2 className="text-3xl text-blue-600 font-bold">{totalEmployees}</h2>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-500">Present Today</p>
          <h2 className="text-3xl text-green-600 font-bold">{stats.presentToday}</h2>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-500">Absent Today</p>
          <h2 className="text-3xl text-red-600 font-bold">{stats.absentToday}</h2>
        </div>
      </div>

      {/* Leave Requests */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Leave Requests</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Email</th>
                <th className="p-3">Start Date</th>
                <th className="p-3">End Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentLeaves.map((leave, i) => (
                <tr key={i} className="hover:bg-blue-50">
                  <td className="p-3 font-medium">{leave.user?.fullName}</td>
                  <td className="p-3">{leave.user?.email}</td>
                  <td className="p-3">{new Date(leave.startDate).toLocaleDateString("en-IN")}</td>
                  <td className="p-3">{new Date(leave.endDate).toLocaleDateString("en-IN")}</td>
                  <td className="p-3 capitalize">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      leave.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : leave.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>{leave.status}</span>
                  </td>
                  <td className="p-3 space-x-2">
                    {leave.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleLeaveStatusUpdate(leave._id, "approved")}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleLeaveStatusUpdate(leave._id, "rejected")}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's Attendance */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Today's Attendance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Designation</th>
                <th className="p-3">Clock In</th>
                <th className="p-3">Clock Out</th>
                <th className="p-3">Notes</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {todayAttendance.map((entry, i) => (
                <tr key={i} className="hover:bg-blue-50">
                  <td className="p-3 font-medium">{entry.user?.fullName}</td>
                  <td className="p-3">{entry.user?.designation}</td>
                  <td className="p-3">{new Date(entry.clockIn).toLocaleTimeString("en-IN")}</td>
                  <td className="p-3">{new Date(entry.clockOut).toLocaleTimeString("en-IN")}</td>
                  <td className="p-3">{entry.notes}</td>
                  <td className="p-3 capitalize">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      entry.status === "present"
                        ? "bg-green-100 text-green-700"
                        : entry.status === "late"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}>{entry.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
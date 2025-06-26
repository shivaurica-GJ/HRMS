// src/pages/Dashboard.js
import { useState, useEffect } from "react";
import { Calendar, FileText, X, CheckCircle, Clock } from "lucide-react";
import { Helmet } from "react-helmet";

export default function Dashboard() {
  const [clockedIn, setClockedIn] = useState(false);
  const [showClockInDialog, setShowClockInDialog] = useState(false);
  const [showClockOutDialog, setShowClockOutDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [dailyNote, setDailyNote] = useState("");
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0 });

  // Leave request form state
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchAttendanceStatus = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/employee/attendance/status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setClockedIn(data.clockedIn);
        }
      } catch (err) {
        console.error("Failed to load attendance status", err);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/employee/attendance/stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load attendance stats", err);
      }
    };

    const fetchLeaves = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/employee/leave`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setLeaveHistory(data);
        }
      } catch (err) {
        console.error("Failed to fetch leave history", err);
      }
    };

    fetchAttendanceStatus();
    fetchStats();
    fetchLeaves();
  }, []);

  const handleClockIn = () => setShowClockInDialog(true);
  const handleClockOut = () => setShowClockOutDialog(true);

  const confirmClockIn = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/employee/clockin`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Failed to clock in");
        return;
      }

      setClockedIn(true);
      setShowClockInDialog(false);
    } catch (err) {
      console.error("Clock-in error:", err);
      alert("Server error. Try again.");
    }
  };

  const confirmClockOut = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/employee/clockout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes: dailyNote }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.msg || "Failed to clock out");
        return;
      }

      setClockedIn(false);
      setDailyNote("");
      setShowClockOutDialog(false);
    } catch (err) {
      console.error("Clock-out error:", err);
      alert("Server error. Try again.");
    }
  };

  const handleRequestLeave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/employee/leave`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: leaveType.toLowerCase().replace(" leave", ""),
            startDate,
            endDate,
            reason: leaveReason,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Leave request failed");
        return;
      }

      // Update leave history
      setLeaveHistory([data, ...leaveHistory]);
      setShowLeaveDialog(false);

      // Reset form
      setLeaveType("Casual Leave");
      setStartDate("");
      setEndDate("");
      setLeaveReason("");
    } catch (err) {
      console.error("Leave request error:", err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <title>Dashboard | Employee</title>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">
            Welcome back! Here's your daily summary
          </p>
        </div>
        <button
          onClick={clockedIn ? handleClockOut : handleClockIn}
          className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
            clockedIn
              ? "bg-red-100 hover:bg-red-200 text-red-700"
              : "bg-blue-100 hover:bg-blue-200 text-blue-700"
          }`}
        >
          <Clock size={20} />
          {clockedIn ? "Clock Out" : "Clock In"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Present This Month"
          value={stats.present}
          change=""
          icon={<Calendar className="text-blue-500" size={24} />}
          color="blue"
        />
        <StatCard
          title="Absent This Month"
          value={stats.absent}
          change=""
          icon={<Calendar className="text-red-500" size={24} />}
          color="red"
        />
        <StatCard
          title="Late This Month"
          value={stats.late}
          change=""
          icon={<Clock className="text-yellow-500" size={24} />}
          color="yellow"
        />
      </div>

      {/* Leave Requests */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Recent Leave Requests
          </h2>
          <button
            onClick={() => setShowLeaveDialog(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
          >
            <FileText size={18} className="mr-2" />
            Request Leave
          </button>
        </div>

        {leaveHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="mx-auto mb-2" size={24} />
            <p>No leave requests yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaveHistory.map((request) => (
              <div
                key={request._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium capitalize">{request.type} Leave</p>
                  <p className="text-sm text-gray-500">
                    {new Date(request.startDate).toLocaleDateString("en-IN")} to{" "}
                    {new Date(request.endDate).toLocaleDateString("en-IN")}
                  </p>
                  <p className="text-sm text-gray-400">
                    Reason: {request.reason}
                  </p>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      request.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : request.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {request.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clock In Dialog */}
      {showClockInDialog && (
        <Dialog onClose={() => setShowClockInDialog(false)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              Confirm Clock In
            </h3>
            <button
              onClick={() => setShowClockInDialog(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          <p className="mb-6 text-gray-600">
            Are you sure you want to clock in for the day?
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowClockInDialog(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmClockIn}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <CheckCircle className="mr-2" size={18} />
              Confirm Clock In
            </button>
          </div>
        </Dialog>
      )}

      {/* Clock Out Dialog */}
      {showClockOutDialog && (
        <Dialog onClose={() => setShowClockOutDialog(false)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Clock Out</h3>
            <button
              onClick={() => setShowClockOutDialog(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              What did you work on today?
            </label>
            <textarea
              value={dailyNote}
              onChange={(e) => setDailyNote(e.target.value)}
              placeholder="Describe your work today..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowClockOutDialog(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmClockOut}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </Dialog>
      )}

      {/* Request Leave Dialog */}
      {showLeaveDialog && (
        <Dialog onClose={() => setShowLeaveDialog(false)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Request Leave</h3>
            <button
              onClick={() => setShowLeaveDialog(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Leave Type</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Earned Leave">Earned Leave</option>
                <option value="Maternity Leave">Maternity Leave</option>
                <option value="Paternity Leave">Paternity Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Reason</label>
              <textarea
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="Explain why you need leave..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowLeaveDialog(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRequestLeave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <FileText className="mr-2" size={18} />
              Submit Request
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

// Reusable Dialog Component
function Dialog({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

// Enhanced StatCard Component
function StatCard({ title, value, icon, change, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
    yellow: "bg-yellow-50 text-yellow-700",
    green: "bg-green-50 text-green-700",
  };

  const borderColors = {
    blue: "border-l-blue-500",
    red: "border-l-red-500",
    yellow: "border-l-yellow-500",
    green: "border-l-green-500",
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${borderColors[color]}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && <p className="text-xs text-gray-500 mt-1">{change}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

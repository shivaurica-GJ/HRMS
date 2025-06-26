import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  FileText,
  X,
  CheckCircle,
  Clock as ClockIcon,
  Loader2,
} from "lucide-react";

function Dialog({ onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
        {children}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [clockedIn, setClockedIn] = useState(false);
  const [showClockInDialog, setShowClockInDialog] = useState(false);
  const [showClockOutDialog, setShowClockOutDialog] = useState(false);
  const [dailyNote, setDailyNote] = useState("");
  const [dateTime, setDateTime] = useState(new Date());
  const [clockInTime, setClockInTime] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState({
    status: true,
    stats: true,
    leaves: true,
  });
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    recentLeaves: [],
    todayAttendance: [],
  });
  const [attendanceStatus, setAttendanceStatus] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
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
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const statusRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/employee/attendance/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const statusData = await statusRes.json();
        setAttendanceStatus(statusData);
        setClockedIn(statusData.clockedIn);
        if (statusData.lastClockIn) {
          setClockInTime(new Date(statusData.lastClockIn));
        }

        const dashboardRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const dashboardJson = await dashboardRes.json();
        setDashboardData(dashboardJson);
        setLoading({ status: false, stats: false, leaves: false });
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading({ status: false, stats: false, leaves: false });
      }
    };

    fetchData();
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
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
      const now = new Date(data.timestamp);
      setClockInTime(now);
      setActivities([
        ...activities,
        {
          id: activities.length + 1,
          task: "Started work",
          time: now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
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
      const now = new Date(data.timestamp);
      setActivities([
        ...activities,
        {
          id: activities.length + 1,
          task: "Finished work",
          time: now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (err) {
      console.error("Clock-out error:", err);
      alert("Server error. Try again.");
    }
  };

  const addActivity = () => {
    if (!dailyNote.trim()) return;
    setActivities([
      ...activities,
      {
        id: activities.length + 1,
        task: dailyNote,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setDailyNote("");
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

  const workDuration =
    clockedIn && clockInTime
      ? Math.floor((new Date() - clockInTime) / 1000 / 60)
      : 0;

  return (
    <div className="space-y-6">
      <title>Dashboard | HR</title>

      {/* Top Bar with Date/Time */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">HR Dashboard</h1>
          <p className="text-gray-500">
            Welcome back! Here's your daily summary
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar size={16} />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Clock size={16} />
              <span>{formattedTime}</span>
            </div>
          </div>

          {loading.status ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <button
              onClick={clockedIn ? handleClockOut : handleClockIn}
              disabled={
                clockedIn
                  ? attendanceStatus?.hasClockedOutToday
                  : attendanceStatus?.hasClockedInToday
              }
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                clockedIn
                  ? "bg-red-100 hover:bg-red-200 text-red-700 disabled:bg-gray-100 disabled:text-gray-400"
                  : "bg-blue-100 hover:bg-blue-200 text-blue-700 disabled:bg-gray-100 disabled:text-gray-400"
              }`}
            >
              <ClockIcon size={20} />
              {clockedIn
                ? attendanceStatus?.hasClockedOutToday
                  ? "Already Clocked Out"
                  : "Clock Out"
                : attendanceStatus?.hasClockedInToday
                ? "Already Clocked In"
                : "Clock In"}
            </button>
          )}
        </div>
      </div>

      {/* Work Duration Indicator */}
      {clockedIn && clockInTime && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-800">Currently Working</h3>
            <p className="text-sm text-blue-600">
              Clocked in at{" "}
              {clockInTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="bg-blue-100 px-3 py-1 rounded-full text-blue-800 font-medium">
            {Math.floor(workDuration / 60)}h {workDuration % 60}m
          </div>
        </div>
      )}

      {/* Activity Tracker */}
      {clockedIn && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Today's Activity Tracker
          </h3>
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={dailyNote}
              onChange={(e) => setDailyNote(e.target.value)}
              placeholder="Add your current activity..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => e.key === "Enter" && addActivity()}
            />
            <button
              onClick={addActivity}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          <div className="border-l-2 border-gray-200 pl-4 ml-3 space-y-4 max-h-60 overflow-y-auto">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="relative">
                  <div className="absolute -left-4 top-2 w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span className="font-medium">{activity.task}</span>
                      <span className="text-gray-500 text-sm">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No activities recorded yet
              </p>
            )}
          </div>
        </div>
      )}

      {/* ROW 1: STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading.stats ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow p-6 flex items-center justify-center"
              >
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ))
        ) : (
          <>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-gray-500">Total Employees</p>
              <h2 className="text-3xl text-blue-600 font-bold">
                {totalEmployees|| 0}
              </h2>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-gray-500">Present Today</p>
              <h2 className="text-3xl text-green-600 font-bold">
                {dashboardData.stats?.presentToday || 0}
              </h2>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-gray-500">On Leave</p>
              <h2 className="text-3xl text-orange-600 font-bold">
                {dashboardData.stats?.onLeave || 0}
              </h2>
            </div>
          </>
        )}
      </div>

      {/* ROW 2: LEAVE REQUEST TABLE */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Recent Leave Requests
          </h3>
        </div>

        {loading.leaves ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : dashboardData.recentLeaves.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2">No leave requests pending</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Leave Dates</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dashboardData.recentLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-blue-50">
                    <td className="p-3 font-medium">{leave.user?.fullName}</td>
                    <td className="p-3">{leave.user?.email}</td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span>
                          {new Date(leave.startDate).toLocaleDateString()}
                        </span>
                        <span className="text-xs">to</span>
                        <span>
                          {new Date(leave.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 max-w-xs truncate">{leave.reason}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          leave.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : leave.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td className="p-3 space-x-2">
                      {leave.status === "Pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleLeaveAction(leave.id, "Approved")
                            }
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleLeaveAction(leave.id, "Rejected")
                            }
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {leave.status !== "Pending" && (
                        <span className="text-gray-500 text-xs">
                          Action completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ROW 3: TODAY'S ATTENDANCE TABLE */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Today's Employee Attendance
        </h3>

        {loading.stats ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : dashboardData.todayAttendance.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2">No attendance records yet</p>
          </div>
        ) : (
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
                {dashboardData.todayAttendance.map((att, i) => (
                  <tr key={i} className="hover:bg-blue-50">
                    <td className="p-3 font-medium">{att.user?.fullName}</td>
                    <td className="p-3">{att.user?.designation}</td>
                    <td className="p-3">
                      {att.clockIn
                        ? new Date(att.clockIn).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
                    </td>
                    <td className="p-3">
                      {att.clockOut
                        ? new Date(att.clockOut).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
                    </td>
                    <td className="p-3">{att.notes}</td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          att.status === "Present"
                            ? "bg-green-100 text-green-700"
                            : att.status === "Late"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            Are you ready to start your workday?
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
              Clock In Now
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
              Summary of your day:
            </label>
            <textarea
              value={dailyNote}
              onChange={(e) => setDailyNote(e.target.value)}
              placeholder="What did you accomplish today?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
          </div>
          <div className="flex justify-between mb-4 text-sm text-gray-600">
            <div>
              <span>Clocked in: </span>
              <span className="font-medium">
                {clockInTime
                  ? clockInTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--:--"}
              </span>
            </div>
            <div>
              <span>Duration: </span>
              <span className="font-medium">
                {Math.floor(workDuration / 60)}h {workDuration % 60}m
              </span>
            </div>
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
              Submit & Clock Out
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

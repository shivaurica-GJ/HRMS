import { useState, useMemo, useEffect } from 'react';

export default function Attendance() {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [statsData, setStatsData] = useState({ totalEmployees: 0, presentToday: 0, absentToday: 0 });

  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [month, year]);

  const dayNames = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = new Date(year, month, i + 1);
      return day.toLocaleDateString('en-US', { weekday: 'short' });
    });
  }, [month, year, daysInMonth]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/attendance/monthly?month=${month + 1}&year=${year}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setAttendanceData(data.data);
        else alert(data.msg || "Failed to fetch attendance");
      } catch (err) {
        console.error("Error fetching attendance:", err);
        alert("Server error");
      }
    };

    const fetchStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setStatsData(data.stats);
        else alert(data.msg || "Failed to fetch stats");
      } catch (err) {
        console.error("Error fetching stats:", err);
        alert("Server error");
      }
    };

    fetchAttendance();
    fetchStats();
  }, [month, year, token]);

  const getStatusCode = (status) => {
    if (status === 'present') return 'P';
    if (status === 'absent') return 'A';
    if (status === 'late') return 'L';
    return '-';
  };

  const employeesMap = useMemo(() => {
    const map = {};
    attendanceData.forEach(record => {
      const userId = record.userId;
      const date = new Date(record.date).getDate();

      if (!map[userId]) {
        map[userId] = {
          name: record.name,
          position: record.designation,
          data: Array(daysInMonth).fill('-')
        };
      }
      map[userId].data[date - 1] = getStatusCode(record.status);
    });
    return Object.values(map);
  }, [attendanceData, daysInMonth]);

  const filteredEmployees = employeesMap.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.position.toLowerCase().includes(search.toLowerCase())
  );

  const calculateStats = (data) => {
    const presentCount = data.filter(s => s === 'P').length;
    const absentCount = data.filter(s => s === 'A').length;
    const leaveCount = data.filter(s => s === 'L').length;
    const percentage = Math.round((presentCount / daysInMonth) * 100);
    return { presentCount, absentCount, leaveCount, percentage };
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = [2023, 2024, 2025];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
      <title>Attendance | Admin</title>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Attendance Tracker</h1>
          <p className="text-gray-500 mt-1">Monitor and manage employee attendance records</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input type="text" placeholder="Search employees or positions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-3 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 w-full sm:w-auto" />
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="text-gray-500 text-sm">Total Employees</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{statsData.totalEmployees}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="text-gray-500 text-sm">Present Today</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{statsData.presentToday}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="text-gray-500 text-sm">Absent Today</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{statsData.absentToday}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="text-gray-500 text-sm">Days in Month</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{daysInMonth}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                {Array.from({ length: daysInMonth }, (_, i) => (
                  <th key={i} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    <div>{i + 1}</div>
                    <div className="text-[10px] text-gray-500">{dayNames[i]}</div>
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Summary</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((emp, idx) => {
                const stats = calculateStats(emp.data);
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                        <div className="text-xs text-gray-500">{emp.position}</div>
                      </div>
                    </td>
                    {emp.data.map((val, i) => (
                      <td key={i} className="text-center px-1 py-4">
                        <div className={`w-7 h-7 mx-auto flex items-center justify-center rounded-full text-xs font-bold ${val === 'P' ? 'bg-green-100 text-green-700' : val === 'A' ? 'bg-red-100 text-red-700' : val === 'L' ? 'bg-yellow-100 text-yellow-700' : ''}`}>{val}</div>
                      </td>
                    ))}
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-medium text-gray-900">{stats.percentage}%</div>
                      <div className="flex space-x-1 mt-1 justify-center">
                        <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">P: {stats.presentCount}</span>
                        <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">A: {stats.absentCount}</span>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">L: {stats.leaveCount}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

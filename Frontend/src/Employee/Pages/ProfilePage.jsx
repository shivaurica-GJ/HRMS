import { useEffect, useState } from "react";

export default function Profile() {
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/employee/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Failed to load profile");

        setEmployeeData({
          name: data.fullName || "N/A",
          position: data.designation || "N/A",
          department: data.department || "N/A",
          email: data.email,
          phone: data.phone || "N/A",
          joinDate: new Date(
            data.employee?.startDate || data.createdAt
          ).toLocaleDateString(),
        });
        setLoading(false);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div>
      <title>Profile | Employee</title>
      <h1 className="text-2xl font-bold text-blue-800 mb-8">My Profile</h1>

      {loading ? (
        <p className="text-gray-500">Loading profile...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl">
          <div className="flex items-center mb-8">
            {/* <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" /> */}
<div className=" p-4 flex justify-between items-center w-full border-b-2">
              <h2 className="text-2xl font-bold">{employeeData.name}</h2>
              <p className="text-blue-600">{employeeData.position}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileInfo label="Department" value={employeeData.position} />
            <ProfileInfo label="Email" value={employeeData.email} />
            <ProfileInfo label="Phone" value={employeeData.phone} />
            <ProfileInfo label="Join Date" value={employeeData.joinDate} />
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileInfo({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

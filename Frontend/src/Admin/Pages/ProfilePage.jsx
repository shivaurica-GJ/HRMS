import { useState, useEffect } from 'react';
import {
  Edit,
  Save,
  User,
  Mail,
  Phone,
  Briefcase,
  CreditCard,
  CalendarDays as Calendar
} from 'lucide-react';

export default function ProfilePage() {
  const [adminData, setAdminData] = useState(null);
  const [tempData, setTempData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok) {
          setAdminData(data);
          setTempData({
            fullName: data.fullName || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            businessName: data.businessName || "",
            gstNumber: data.gstNumber || "",
            businessAddress: data.businessAddress || "",
            joinDate: data.createdAt || ""
          });
        } else {
          console.error("Failed to load admin profile:", data.msg);
        }
      } catch (err) {
        console.error("Error fetching admin profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  const handleInputChange = (e) => {
    setTempData({ ...tempData, [e.target.name]: e.target.value });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setTempData({ ...adminData });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: tempData.fullName,
          phoneNumber: tempData.phoneNumber,
          businessName: tempData.businessName,
          gstNumber: tempData.gstNumber,
          businessAddress: tempData.businessAddress
        })
      });

      const updated = await res.json();

      if (!res.ok) {
        alert(updated.msg || "Failed to update profile");
        return;
      }

      alert("Profile updated successfully!");
      setAdminData({ ...adminData, ...updated });
      setIsEditing(false);
    } catch (err) {
      console.error("Update error:", err);
      alert("Error saving profile. Try again.");
    }
  };

  const formatIST = (dateStr) =>
    new Date(dateStr).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "long",
      timeStyle: "short"
    });

  if (loading || !tempData.fullName) {
    return <p className="p-6 text-gray-600">Loading admin profile...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <title>Profile | Admin</title>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Profile</h1>
            <p className="text-gray-600 mt-1">Manage your personal and business information</p>
          </div>

          <button
            onClick={handleEditToggle}
            className={`mt-4 md:mt-0 flex items-center cursor-pointer px-5 py-2.5 rounded-lg transition-all ${
              isEditing
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="flex flex-col md:flex-row">
            {/* Profile Header */}
            <div className="md:w-1/3 mb-8 md:mb-0 md:pr-8 border-b md:border-b-0 md:border-r border-gray-100">
              <div className="flex flex-col items-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 mb-4" />
                <h2 className="text-xl font-semibold text-gray-800">{tempData.fullName}</h2>
                <p className="text-gray-600 mt-1">Admin</p>
                <div className="flex items-center mt-2 text-gray-500 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Joined {formatIST(tempData.joinDate)}</span>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="md:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <User className="mr-2 h-5 w-5 text-gray-500" />
                    Personal Information
                  </h3>

                  <div className="space-y-4">
                    <InputBlock label="Full Name" name="fullName" value={tempData.fullName} isEditing={isEditing} onChange={handleInputChange} />
                    <InputBlock label="Email" name="email" value={tempData.email} isEditing={false} icon={Mail} />
                    <InputBlock label="Phone Number" name="phoneNumber" value={tempData.phoneNumber} isEditing={isEditing} onChange={handleInputChange} icon={Phone} />
                  </div>
                </div>

                {/* Business Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <Briefcase className="mr-2 h-5 w-5 text-gray-500" />
                    Business Information
                  </h3>

                  <div className="space-y-4">
                    <InputBlock label="Business Name" name="businessName" value={tempData.businessName} isEditing={isEditing} onChange={handleInputChange} />
                    <InputBlock label="GST Number" name="gstNumber" value={tempData.gstNumber} isEditing={isEditing} onChange={handleInputChange} icon={CreditCard} />

                    {isEditing ? (
                      <textarea
                        name="businessAddress"
                        value={tempData.businessAddress}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter address"
                      />
                    ) : (
                      <p className="text-gray-800">{tempData.businessAddress}</p>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="flex items-center cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Last updated: {formatIST(tempData.joinDate)}</p>
        </div>
      </div>
    </div>
  );
}

function InputBlock({ label, name, value, isEditing, onChange, icon: Icon }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
      {isEditing ? (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : Icon ? (
        <div className="flex items-center">
          <Icon className="h-4 w-4 text-gray-400 mr-2" />
          <p className="text-gray-800">{value}</p>
        </div>
      ) : (
        <p className="text-gray-800">{value}</p>
      )}
    </div>
  );
}

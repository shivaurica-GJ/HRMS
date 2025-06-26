import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function EmployeeManage() {
  const { id } = useParams();

  const [basicInfo, setBasicInfo] = useState({
    name: "",
    email: "",
    position: "",
    startDate: "",
    isActive: true,
  });

  const [docsInfo, setDocsInfo] = useState({
    aadhaar: "",
    pan: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
  });

  const [loading, setLoading] = useState(true); // ✅ loading state
  const token = localStorage.getItem("token");

  const fetchEmployee = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/employees/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.msg || "Failed to load employee details");
        return;
      }

      setBasicInfo({
        name: data.fullName || "",
        email: data.email || "",
        position: data.designation || "",
        startDate: data.joinDate?.slice(0, 10) || "",
        isActive: data.isActive,
      });

      const emp = data.employee || {};
      setDocsInfo({
        aadhaar: emp.aadharNumber || "",
        pan: emp.panNumber || "",
        bankName: emp.bankName || "",
        accountNumber: emp.accountNumber || "",
        ifsc: emp.ifscCode || "",
      });

      setLoading(false); // ✅ stop loading
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Server error fetching employee");
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id, token]);

  const handleBasicInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBasicInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDocsInfoChange = (e) => {
    const { name, value } = e.target;
    setDocsInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (section) => {
    const payload = {
      fullName: basicInfo.name,
      email: basicInfo.email,
      designation: basicInfo.position,
      joinDate: basicInfo.startDate,
      isActive: basicInfo.isActive,
      aadharNumber: docsInfo.aadhaar,
      panNumber: docsInfo.pan,
      bankName: docsInfo.bankName,
      accountNumber: docsInfo.accountNumber,
      ifscCode: docsInfo.ifsc,
    };

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/employees/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Update failed");
        return;
      }

      alert(`Successfully updated ${section} info`);

      // ✅ Fetch updated data to show saved values
      fetchEmployee();
    } catch (err) {
      console.error("Update error:", err);
      alert("Server error during update.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <title>Manage Employee | HR</title>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Manage Employee
        </h1>
        <p className="text-gray-500 mt-1">ID: {id}</p>
      </div>

      {/* Basic Info Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Personal Information
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Basic employee details and contact information
            </p>
          </div>
          <button
            onClick={() => handleSubmit("basic")}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
          >
            Save
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              name="name"
              value={basicInfo.name}
              onChange={handleBasicInfoChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={basicInfo.email}
              onChange={handleBasicInfoChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <input
              name="position"
              value={basicInfo.position}
              onChange={handleBasicInfoChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={basicInfo.startDate}
              onChange={handleBasicInfoChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            />
          </div>

          {/* Employment Status Toggle */}
          <div className="md:col-span-2 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employment Status
            </label>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={basicInfo.isActive}
                  onChange={handleBasicInfoChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {basicInfo.isActive
                    ? "Active"
                    : "Inactive (Left the company)"}
                </span>
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {basicInfo.isActive
                ? "Employee currently works at the company"
                : "Employee has left the company and no longer has access"}
            </p>
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Financial Details
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Government IDs and banking information
            </p>
          </div>
          <button
            onClick={() => handleSubmit("docs")}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
          >
            Save
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aadhaar Number
            </label>
            <input
              name="aadhaar"
              value={docsInfo.aadhaar}
              onChange={handleDocsInfoChange}
              placeholder="XXXX-XXXX-XXXX"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PAN Number
            </label>
            <input
              name="pan"
              value={docsInfo.pan}
              onChange={handleDocsInfoChange}
              placeholder="ABCDE1234F"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name
            </label>
            <input
              name="bankName"
              value={docsInfo.bankName}
              onChange={handleDocsInfoChange}
              placeholder="e.g. State Bank of India"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            <input
              name="accountNumber"
              value={docsInfo.accountNumber}
              onChange={handleDocsInfoChange}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IFSC Code
            </label>
            <input
              name="ifsc"
              value={docsInfo.ifsc}
              onChange={handleDocsInfoChange}
              placeholder="SBIN0000000"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

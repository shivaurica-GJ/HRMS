// src/pages/PayrollPage.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function PayrollPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayroll, setSelectedPayroll] = useState(null); // Track selected payroll for details
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Control dialog visibility

  // New state for salary processing form
  const [salaryForm, setSalaryForm] = useState({
    employeeId: "",
    baseSalary: "",
    overtime: "",
    bonus: "",
    deductions: {
      amount: "",
      reason: "",
    },
    netPay: "",
    paymentMethod: "Bank Transfer",
  });

  // Month state
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // Get current month in YYYY-MM format
  function getCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  }

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/admin/employees`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setEmployees(response.data);
      } catch (err) {
        setError("Failed to fetch employees");
        console.error(err);
      }
    };

    fetchEmployees();
  }, []);

  // Fetch payrolls for selected month
  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/payroll?month=${selectedMonth}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setPayrolls(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch payroll data");
        setLoading(false);
        console.error(err);
      }
    };

    if (employees.length > 0) {
      fetchPayrolls();
    }
  }, [selectedMonth, employees]);

  // Generate months for dropdown (last 12 months)
  const generateMonths = () => {
    const months = [];
    const date = new Date();

    for (let i = 0; i < 12; i++) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      months.push({
        value: `${year}-${month}`,
        label: `${new Date(year, month - 1).toLocaleString("default", {
          month: "long",
        })} ${year}`,
      });

      date.setMonth(date.getMonth() - 1);
    }

    return months;
  };

  // Get last day of month for payment date
  const getLastDayOfMonth = (monthString) => {
    const [year, month] = monthString.split("-");
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${month}-${lastDay}`;
  };

  // Format currency in INR
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setSalaryForm((prev) => {
      // Create a copy of the previous state
      const updatedForm = { ...prev };

      // Handle deductions separately
      if (name === "deductionAmount" || name === "deductionReason") {
        updatedForm.deductions = {
          ...prev.deductions,
          [name === "deductionAmount" ? "amount" : "reason"]: value,
        };
      } else {
        updatedForm[name] = value;
      }

      // Always recalculate net pay when relevant fields change
      const base = parseFloat(updatedForm.baseSalary) || 0;
      const overtime = parseFloat(updatedForm.overtime) || 0;
      const bonus = parseFloat(updatedForm.bonus) || 0;
      const deductions = parseFloat(updatedForm.deductions.amount) || 0;

      const netPay = base + overtime + bonus - deductions;
      updatedForm.netPay = isNaN(netPay) ? "" : netPay;

      return updatedForm;
    });
  };

  // Handle form submission
  const handleSubmitSalary = async (e) => {
    e.preventDefault();

    try {
      // Validate net pay calculation
      const base = parseFloat(salaryForm.baseSalary) || 0;
      const overtime = parseFloat(salaryForm.overtime) || 0;
      const bonus = parseFloat(salaryForm.bonus) || 0;
      const deductions = parseFloat(salaryForm.deductions.amount) || 0;
      const calculatedNetPay = base + overtime + bonus - deductions;

      // Compare calculated vs entered net pay
      if (parseFloat(salaryForm.netPay) !== calculatedNetPay) {
        alert(
          `Net pay mismatch! Calculated: ${calculatedNetPay}, Entered: ${salaryForm.netPay}. Using calculated value.`
        );
      }

      const paymentDate = getLastDayOfMonth(selectedMonth);

      const payload = {
        userId: salaryForm.employeeId,
        paymentDate,
        baseSalary: base,
        overtime,
        bonus,
        deductions: {
          amount: deductions,
          reason: salaryForm.deductions.reason || "",
        },
        netPay: calculatedNetPay, // Always use calculated value
        status: "Paid",
        paymentMethod: salaryForm.paymentMethod || "Bank Transfer", // Get from form state
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/payroll`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Add new payroll to state
      setPayrolls((prev) => [...prev, response.data]);

      // Reset form while preserving payment method
      setSalaryForm({
        employeeId: "",
        baseSalary: "",
        overtime: "",
        bonus: "",
        deductions: {
          amount: "",
          reason: "",
        },
        netPay: "",
        paymentMethod: salaryForm.paymentMethod, // Keep payment method selection
      });

      alert("Salary processed successfully!");
    } catch (err) {
      console.error("Error processing salary:", err);
      let errorMsg = "Failed to process salary. Please try again.";

      if (err.response) {
        if (err.response.status === 400) {
          errorMsg =
            "Validation error: " +
            (err.response.data.message || "Check your input values");
        } else if (err.response.status === 409) {
          errorMsg =
            "Duplicate entry: Payroll already exists for this employee and month";
        }
      }

      alert(errorMsg);
    }
  };

  // Calculate stats
  const paidCount = payrolls.filter((p) => p.status === "Paid").length;
  const pendingCount = employees.length - paidCount;
  const totalPayroll = payrolls.reduce((sum, p) => sum + p.netPay, 0);

  // Get employee details for payroll
  const getEmployeeDetails = (userId) => {
    return employees.find((e) => e._id === userId) || {};
  };

  // Open payroll details dialog
  const openPayrollDetails = (payroll) => {
    setSelectedPayroll(payroll);
    setIsDialogOpen(true);
  };

  // Close dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedPayroll(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <title>Payroll | Admin</title>
      
      {/* Details Dialog */}
      {isDialogOpen && selectedPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Payroll Details
                </h2>
                <button
                  onClick={closeDialog}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Employee Information
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedPayroll.user?.fullName || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Position:</span>{" "}
                      {selectedPayroll.user?.position || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Department:</span>{" "}
                      {selectedPayroll.user?.department || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Payment Details
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(
                        selectedPayroll.paymentDate
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          selectedPayroll.status === "Paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {selectedPayroll.status}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Method:</span>{" "}
                      {selectedPayroll.paymentMethod || "Bank Transfer"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Salary Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Base Salary:</span>
                    <span className="font-medium">
                      {formatCurrency(selectedPayroll.baseSalary)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overtime:</span>
                    <span className="font-medium">
                      {formatCurrency(selectedPayroll.overtime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bonus/Incentives:</span>
                    <span className="font-medium">
                      {formatCurrency(selectedPayroll.bonus)}
                    </span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>
                      Deductions:{" "}
                      <span className="text-gray-500 text-sm">
                        ({selectedPayroll.deductions?.reason || "No reason provided"})
                      </span>
                    </span>
                    <span className="font-medium">
                      -{formatCurrency(selectedPayroll.deductions?.amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3 mt-2">
                    <span className="font-semibold">Net Pay:</span>
                    <span className="font-bold text-lg text-indigo-700">
                      {formatCurrency(selectedPayroll.netPay)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={closeDialog}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Payroll Management
        </h1>
        <p className="text-gray-500 mt-1">
          Process salaries and view payment history
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Salary Processing Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-6">
            Process Salary
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processing for Month
            </label>
            <div className="px-3 py-2 md:px-4 md:py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium">
              {new Date(`${selectedMonth}-01`).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>

          <form onSubmit={handleSubmitSalary} className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Employee
              </label>
              <select
                name="employeeId"
                value={salaryForm.employeeId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              >
                <option value="">Select an employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.fullName} - {emp.position}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Salary (₹)
                </label>
                <input
                  type="number"
                  name="baseSalary"
                  value={salaryForm.baseSalary}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overtime (₹)
                </label>
                <input
                  type="number"
                  name="overtime"
                  value={salaryForm.overtime}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bonus/Incentives (₹)
                </label>
                <input
                  type="number"
                  name="bonus"
                  value={salaryForm.bonus}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deductions (₹)
                </label>
                <input
                  type="number"
                  name="deductionAmount"
                  value={salaryForm.deductions.amount}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deduction Reason (Optional)
              </label>
              <input
                type="text"
                name="deductionReason"
                value={salaryForm.deductions.reason}
                onChange={handleInputChange}
                placeholder="Late arrival, damage, etc."
                className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={salaryForm.paymentMethod}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Online Payment">Online Payment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="bg-indigo-50 rounded-lg p-3 md:p-4">
              <div className="flex justify-between items-center">
                <div className="font-medium text-indigo-800">Net Pay</div>
                <div className="text-xl md:text-2xl font-bold text-indigo-700">
                  {salaryForm.netPay ? formatCurrency(salaryForm.netPay) : "₹0"}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex justify-center items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Process Salary Payment
            </button>
          </form>
        </div>

        {/* Transactions Section */}
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-5">
              <div className="text-gray-500 text-sm">Total Payroll</div>
              <div className="text-xl md:text-2xl font-bold text-gray-800 mt-1">
                {formatCurrency(totalPayroll)}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-5">
              <div className="text-gray-500 text-sm">Total Employees</div>
              <div className="text-xl md:text-2xl font-bold text-indigo-600 mt-1">
                {employees.length}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-5">
              <div className="text-gray-500 text-sm">Paid</div>
              <div className="text-xl md:text-2xl font-bold text-green-600 mt-1">
                {paidCount}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-5">
              <div className="text-gray-500 text-sm">Pending</div>
              <div className="text-xl md:text-2xl font-bold text-yellow-600 mt-1">
                {pendingCount}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-4 md:mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Salary Transactions
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Past salary payments and records
                </p>
              </div>

              <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto mt-2 md:mt-0">
                <div className="relative w-full md:w-auto min-w-[150px] md:min-w-[200px]">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-3 py-2 md:py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 w-full"
                  />
                </div>

                <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="px-3 py-2 md:px-4 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm w-full md:w-auto"
                  >
                    <option value="">All Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>

                  {/* Month dropdown */}
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 md:px-4 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm w-full md:w-auto"
                  >
                    {generateMonths().map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>

                  {/* <button className="px-3 py-2 md:px-4 md:py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-1 md:gap-2 hover:bg-gray-50 w-full md:w-auto justify-center">
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                    Export
                  </button> */}
                </div>
              </div>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center p-8 md:p-12">
                <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="px-4 py-8 md:px-6 md:py-12 text-center text-red-600">
                <svg
                  className="mx-auto h-10 w-10 md:h-12 md:w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium">
                  Failed to load payroll data
                </h3>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Employee
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Payment Date
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Net Pay
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 md:px-6 md:py-12 text-center">
                          <svg
                            className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No employees found
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Add employees to process payroll
                          </p>
                        </td>
                      </tr>
                    ) : employees.filter((employee) => {
                        const name = employee.fullName || "";
                        return name
                          .toLowerCase()
                          .includes(search.toLowerCase());
                      }).length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 md:px-6 md:py-12 text-center">
                          <svg
                            className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No matching employees
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Try adjusting your search query
                          </p>
                        </td>
                      </tr>
                    ) : (
                      employees
                        .filter((employee) => {
                          const name = employee.fullName || "";
                          return name
                            .toLowerCase()
                            .includes(search.toLowerCase());
                        })
                        .map((employee) => {
                          const payroll = payrolls.find(
                            (p) => p.user?._id === employee._id
                          );

                          const status = payroll ? payroll.status : "Pending";
                          const statusColor =
                            status === "Paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800";

                          return (
                            <tr key={employee._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <div className="ml-2">
                                    <div className="text-sm font-medium text-gray-900">
                                      {employee.fullName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {employee.position}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-gray-900">
                                  {payroll
                                    ? new Date(
                                        payroll.paymentDate
                                      ).toLocaleDateString()
                                    : "-"}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {payroll
                                    ? formatCurrency(payroll.netPay)
                                    : "-"}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
                                >
                                  {status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {payroll ? (
                                  <button 
                                    onClick={() => openPayrollDetails(payroll)}
                                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                  >
                                    View Details
                                  </button>
                                ) : (
                                  <span className="text-gray-400 text-sm">
                                    -
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stats footer */}
          <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 md:gap-4 text-sm text-gray-500">
            <div>
              Showing{" "}
              {
                employees.filter((e) =>
                  e.fullName?.toLowerCase().includes(search.toLowerCase())
                ).length
              }{" "}
              of {employees.length} employees
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from "react";

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

export default function StatCard({ title, value, icon, change, color }) {
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

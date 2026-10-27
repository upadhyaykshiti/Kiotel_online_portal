
"use client"; // Mark this as a Client Component

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faIdCard, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

export default function EmployeeProfile({ employee }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Header */}
      <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center space-x-2">
        <FontAwesomeIcon icon={faUser} className="text-blue-500" />
        <span>Welcome, {employee.first_name}!</span>
      </h2>

      {/* Profile Details */}
      <div className="space-y-4 text-gray-700">
        {/* Unique ID */}
        <div className="flex items-center space-x-3 group hover:bg-gray-50 p-2 rounded transition-all duration-200">
          <FontAwesomeIcon icon={faIdCard} className="text-gray-500 group-hover:text-blue-500 transition-colors" />
          <div>
            <p className="font-medium text-sm text-gray-500">Unique ID</p>
            <p className="text-lg text-gray-800">{employee.unique_id}</p>
          </div>
        </div>

        {/* First Name */}
        <div className="flex items-center space-x-3 group hover:bg-gray-50 p-2 rounded transition-all duration-200">
          <FontAwesomeIcon icon={faUser} className="text-gray-500 group-hover:text-blue-500 transition-colors" />
          <div>
            <p className="font-medium text-sm text-gray-500">First Name</p>
            <p className="text-lg text-gray-800">{employee.first_name}</p>
          </div>
        </div>

        {/* Last Name */}
        <div className="flex items-center space-x-3 group hover:bg-gray-50 p-2 rounded transition-all duration-200">
          <FontAwesomeIcon icon={faUser} className="text-gray-500 group-hover:text-blue-500 transition-colors" />
          <div>
            <p className="font-medium text-sm text-gray-500">Last Name</p>
            <p className="text-lg text-gray-800">{employee.last_name}</p>
          </div>
        </div>

        {/* Date of Joining */}
        <div className="flex items-center space-x-3 group hover:bg-gray-50 p-2 rounded transition-all duration-200">
          <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500 group-hover:text-blue-500 transition-colors" />
          <div>
            <p className="font-medium text-sm text-gray-500">Date of Joining</p>
            <p className="text-lg text-gray-800">{employee.date_of_joining}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
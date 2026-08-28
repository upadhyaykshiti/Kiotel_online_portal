"use client";

import React from "react";

export default function EmployeeSelector({ value, onChange, employees = [] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded px-3 py-2"
    >
      <option value="">-- Select Employee --</option>
      {employees.map((emp) => (
        <option key={emp.id} value={emp.id}>
          {emp.name}
        </option>
      ))}
    </select>
  );
}
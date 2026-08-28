"use client";

import React from "react";

export default function ShiftTypeSelector({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded px-3 py-2"
    >
      <option value="morning">Morning</option>
      <option value="afternoon">Afternoon</option>
      <option value="night">Night</option>
      <option value="off">Day Off</option>
    </select>
  );
}
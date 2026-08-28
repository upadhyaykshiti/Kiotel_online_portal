
import React from "react";

export const InputField = ({ label, name, type = "text", required = false, defaultValue = "" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input 
      type={type} 
      name={name} 
      required={required} 
      defaultValue={defaultValue} 
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white" 
    />
  </div>
);

export const TextArea = ({ label, name, required = false, rows = 3, defaultValue = "" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea 
      name={name} 
      required={required} 
      rows={rows} 
      defaultValue={defaultValue} 
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white" 
    />
  </div>
);

export const RadioGroup = ({ label, name, required = false, options = ["Yes", "No"], defaultChecked = "" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="mt-2 space-x-4 flex flex-wrap">
      {options.map((opt) => (
        <label key={opt} className="inline-flex items-center">
          <input 
            type="radio" 
            name={name} 
            value={opt} 
            required={required} 
            defaultChecked={defaultChecked === opt} 
            className="mr-1 text-blue-600 focus:ring-blue-500" 
          />
          <span className="text-sm text-gray-700">{opt}</span>
        </label>
      ))}
    </div>
  </div>
);
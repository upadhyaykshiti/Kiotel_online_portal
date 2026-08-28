// src/components/schedule/ShiftTemplatePanel.jsx
import React from 'react';
import { format } from 'date-fns';

const ShiftTemplatePanel = ({ shiftTypes, selectedTemplate, setSelectedTemplate }) => {
  if (!shiftTypes || shiftTypes.length === 0) {
    return (
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-500">
        No shift types available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 mb-6">
      <h3 className="font-bold text-lg text-slate-800 mb-4">Shift Templates</h3>
      <div className="space-y-3">
        {shiftTypes.map((shiftType) => (
          <div
            key={shiftType.id}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
              selectedTemplate?.id === shiftType.id
                ? 'bg-blue-100 border border-blue-300'
                : 'hover:bg-slate-100 border border-slate-200'
            }`}
            onClick={() => setSelectedTemplate(shiftType)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                {shiftType.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-slate-800">{shiftType.name}</div>
                <div className="text-sm text-slate-500">{shiftType.start_time} – {shiftType.end_time}</div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent selecting the template when clicking copy
                setSelectedTemplate(shiftType);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                selectedTemplate?.id === shiftType.id
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Copy
            </button>
          </div>
        ))}
      </div>
      {selectedTemplate && (
        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <p className="text-sm text-blue-800">
            <strong>Selected:</strong> {selectedTemplate.name} ({selectedTemplate.start_time}–{selectedTemplate.end_time})
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Click any empty or occupied cell in the schedule grid to apply this shift.
          </p>
        </div>
      )}
    </div>
  );
};

export default ShiftTemplatePanel;
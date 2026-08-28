// src/components/schedule/ResponsiveScheduleGrid.jsx

'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import ShiftCell from './ShiftCell'; // Re-use your existing cell component

const ResponsiveScheduleGrid = ({
  employees,
  weekDays,
  scheduleEntries,
  shiftTypes,
  leaveTypes,
  openEditModal,
  userRole,
  currentSchedule,
  selectedTemplate,
  setSelectedCells,
  selectedCells,
  multiTemplateSelections,
  handleMultiTemplateSelection,
  isDragging,
  handleDragStart,
  applyTemplateToAllDaysForEmployee,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (isMobile) {
    // MOBILE VIEW: Render each employee as a vertical card
    return (
      <div className="space-y-4">
        {employees.map((employee) => (
          <div key={employee.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {employee.initials || employee.first_name[0] + employee.last_name[0]}
                </div>
                <div>
                  <div className="font-semibold text-slate-800">{employee.first_name} {employee.last_name}</div>
                  <div className="text-xs text-slate-500">{employee.role}</div>
                </div>
              </div>
              {/* Mobile "Copy All" button */}
              <button
                onClick={() => applyTemplateToAllDaysForEmployee(employee.id)}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-200 transition-colors"
              >
                All Days
              </button>
            </div>

            {/* Render a row for each day */}
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                return (
                  <div key={dateStr} className="border border-slate-200 rounded-lg p-1">
                    <div className="text-xs text-center text-slate-500 mb-1">
                      {format(day, 'EEE')}
                    </div>
                    <div className="text-xs text-center text-slate-700 mb-1">
                      {format(day, 'd')}
                    </div>
                    <ShiftCell
                      employeeId={employee.id}
                      dateStr={dateStr}
                      scheduleEntries={scheduleEntries}
                      shiftTypes={shiftTypes}
                      leaveTypes={leaveTypes}
                      openEditModal={openEditModal}
                      userRole={userRole}
                      currentSchedule={currentSchedule}
                      selectedTemplate={selectedTemplate}
                      setSelectedCells={setSelectedCells}
                      selectedCells={selectedCells}
                      multiTemplateSelections={multiTemplateSelections}
                      handleMultiTemplateSelection={handleMultiTemplateSelection}
                      isDragging={isDragging}
                      handleDragStart={handleDragStart}
                      employees={employees}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // DESKTOP VIEW: Keep the existing table structure
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-48">Employees</th>
            {weekDays.map((day) => (
              <th key={format(day, 'yyyy-MM-dd')} className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                <div className="flex flex-col items-center">
                  <span>{format(day, 'EEE')}</span>
                  <span className="text-lg font-semibold">{format(day, 'd')}</span>
                  <span className="text-xs text-slate-400">{format(day, 'MMM')}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                    {employee.initials || employee.first_name[0] + employee.last_name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{employee.first_name} {employee.last_name}</div>
                    <div className="text-xs text-slate-500">{employee.role}</div>
                  </div>
                </div>
              </td>
              {weekDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                return (
                  <td key={dateStr} className="px-4 py-4 whitespace-nowrap">
                    <ShiftCell
                      employeeId={employee.id}
                      dateStr={dateStr}
                      scheduleEntries={scheduleEntries}
                      shiftTypes={shiftTypes}
                      leaveTypes={leaveTypes}
                      openEditModal={openEditModal}
                      userRole={userRole}
                      currentSchedule={currentSchedule}
                      selectedTemplate={selectedTemplate}
                      setSelectedCells={setSelectedCells}
                      selectedCells={selectedCells}
                      multiTemplateSelections={multiTemplateSelections}
                      handleMultiTemplateSelection={handleMultiTemplateSelection}
                      isDragging={isDragging}
                      handleDragStart={handleDragStart}
                      employees={employees}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResponsiveScheduleGrid;




// src/components/schedule/MonthView.jsx
import React, { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfDay, endOfDay, subMonths, addMonths, isSameMonth, isSameDay } from 'date-fns';
import MonthViewCell from './MonthViewCell';

const MonthView = ({
  selectedMonth,
  setSelectedMonth,
  myPastEntries = [],
  scheduleEntries = [], // ✅ Received active local edits
  shiftTypes,
  uniqueId,
  openEditModal,
  userRole,
  currentSchedule
}) => {

  const start = startOfMonth(selectedMonth);
  const end = endOfMonth(selectedMonth);
  const daysInMonth = eachDayOfInterval({ start, end });
  const startDayOfWeek = start.getDay(); // 0 for Sunday

  // ✅ INSTANT UPDATE FIX: Merges historical data with local active edits
  const entriesToUse = useMemo(() => {
    const base = Array.isArray(myPastEntries) ? myPastEntries : [];
    const active = Array.isArray(scheduleEntries) ? scheduleEntries : [];
    
    // Map ensures that active local edits override historical ones for the same day
    const merged = new Map();
    base.forEach(e => merged.set(`${e.user_id}_${e.entry_date}`, e));
    active.forEach(e => merged.set(`${e.user_id}_${e.entry_date}`, e));
    
    return Array.from(merged.values());
  }, [myPastEntries, scheduleEntries]);

  // Create an array representing the grid (including empty cells for the start of the week)
  const gridDays = [];
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    gridDays.push(null);
  }
  // Add the actual days of the month
  gridDays.push(...daysInMonth);

  // Calculate how many empty cells are needed at the end to make 6 rows (7 days * 6 rows = 42 cells)
  const totalCells = 42;
  while (gridDays.length < totalCells) {
    gridDays.push(null);
  }

  const weekDaysNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm p-2 sm:p-4 bg-white">
      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-4 px-2">
        <button
          onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors shadow-sm font-medium"
        >
          ← Prev
        </button>
        <h2 className="text-xl font-bold text-slate-800">{format(selectedMonth, 'MMMM yyyy')}</h2>
        <button
          onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors shadow-sm font-medium"
        >
          Next →
        </button>
      </div>
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-slate-100 to-slate-200">
            {weekDaysNames.map((day, i) => (
              <th
                key={i}
                className="border-b border-r border-slate-200 p-2 text-center text-slate-800 font-bold text-sm"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, weekIndex) => {
            const weekStartIndex = weekIndex * 7;
            const weekEndIndex = weekStartIndex + 7;
            const weekDays = gridDays.slice(weekStartIndex, weekEndIndex);

            return (
              <tr key={weekIndex} className="border-b border-slate-200">
                {weekDays.map((day, dayIndex) => (
                  <td key={dayIndex} className="border-r border-slate-200 p-1 align-middle">
                    {/* ✅ Added the stretch wrapper so the cells perfectly fill the table grid */}
                    <div className="w-full h-full min-h-[4rem] flex items-stretch justify-center mx-auto">
                      {day ? (
                        <MonthViewCell
                          date={day}
                          myPastEntries={entriesToUse} // ✅ Passed the merged entries here
                          shiftTypes={shiftTypes}
                          uniqueId={uniqueId}
                          // ✅ NEW: Pass editing props down to the cell
                          openEditModal={openEditModal}
                          userRole={userRole}
                          currentSchedule={currentSchedule}
                        />
                      ) : (
                        <div className="w-full h-full min-h-[4rem]"></div> // Placeholder for empty cells
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MonthView;
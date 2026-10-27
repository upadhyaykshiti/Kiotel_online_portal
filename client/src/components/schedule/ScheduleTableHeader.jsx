


// src/components/schedule/ScheduleTableHeader.jsx
import React from 'react';
import { format, isToday } from 'date-fns';

const ScheduleTableHeader = ({ weekDays }) => {
  return (
    <tr>
      {/* Employee column header */}
      <th
        style={{
          minWidth: '130px',
          width: '130px',
          position: 'sticky',
          left: 0,
          top: 0,
          zIndex: 40,
          backgroundColor: '#f1f5f9',
        }}
        className="border-r border-b border-slate-200 text-left text-slate-700 font-bold p-3 text-xs"
      >
        Employees
      </th>

      {/* Day column headers - sticky top only, NOT left */}
      {weekDays.map((d, i) => (
        <th
          key={i}
          style={{
            minWidth: '110px',
            width: '110px',
            position: 'sticky',
            top: 0,
            zIndex: 10,   // Lower than employee column
            backgroundColor: isToday(d) ? '#eff6ff' : '#f1f5f9',
          }}
          className={`border-r border-b border-slate-200 text-center font-semibold p-2 text-xs
            ${isToday(d) ? 'text-blue-700' : 'text-slate-700'}`}
        >
          <div className="font-bold text-sm">{format(d, 'EEE')}</div>
          <div className="font-normal text-xs mt-0.5 opacity-75">{format(d, 'd MMM')}</div>
        </th>
      ))}
    </tr>
  );
};

export default ScheduleTableHeader;



// src/components/schedule/MonthViewCell.jsx
import React from 'react';
import { format } from 'date-fns';

const MonthViewCell = ({
  date,
  myPastEntries,
  shiftTypes,
  uniqueId, 
  openEditModal,
  userRole,
  currentSchedule
}) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const entry = myPastEntries.find(e => e.entry_date === dateStr && Number(e.user_id) === Number(uniqueId));

  const isEditable = [1, 5].includes(userRole) && currentSchedule;

  const handleCellClick = () => {
    if (isEditable && openEditModal) {
      openEditModal(uniqueId, dateStr, entry);
    }
  };

  let content, bgColor, borderColor, textColor = 'text-black';
  
  if (entry) {
    if (entry.assignment_status === 'ASSIGNED') {
      const shiftType = shiftTypes.find(st => st.id == entry.shift_type_id);
      const shiftName = shiftType?.name || '';
      
      content = (
        <>
          <div className="font-semibold text-xs whitespace-nowrap">{shiftName}</div>
          <div className="text-xs whitespace-nowrap mt-0.5">{entry.property_name}</div>
        </>
      );
      
      // ✅ Added Half Day Logic
      const isHalfDay = shiftName.toLowerCase().includes('half') || entry.is_halfday_approved === 1 || entry.is_halfday_approved === true;
      const isBlueShift = shiftName.includes('EX') || shiftName.includes('Double') || shiftName.includes('_');
      
      if (isHalfDay) {
        bgColor = 'bg-yellow-100';
        borderColor = 'border-yellow-400';
        textColor = 'text-yellow-900';
      } else if (isBlueShift) {
        bgColor = 'bg-blue-100';
        borderColor = 'border-blue-300';
        textColor = 'text-blue-800';
      } else {
        bgColor = 'bg-white';
        borderColor = 'border-gray-300';
        textColor = 'text-black';
      }
      
    } else {
      let statusText = '';
      switch (entry.assignment_status) {
        case 'HALF_DAY':
          statusText = 'Half Day';
          bgColor = 'bg-yellow-100';
          borderColor = 'border-yellow-400';
          textColor = 'text-yellow-900';
          break;
        case 'PTO_REQUESTED':
          statusText = 'LLOP';
          bgColor = 'bg-gray-800';
          borderColor = 'border-gray-600';
          textColor = 'text-red-400';
          break;
        case 'LLOP_EX':
          statusText = 'LLOP EX';
          bgColor = 'bg-gray-800';
          borderColor = 'border-gray-600';
          textColor = 'text-red-400';
          break;
        case 'PTO_APPROVED':
          statusText = 'Paid Leave';
          bgColor = 'bg-purple-100';
          borderColor = 'border-purple-300';
          textColor = 'text-purple-800';
          break;
        case 'FESTIVE_LEAVE':
          statusText = 'Festive leave';
          bgColor = 'bg-pink-100';
          borderColor = 'border-pink-300';
          textColor = 'text-pink-800';
          break;
        case 'UNAVAILABLE':
          statusText = 'Week OFF';
          bgColor = 'bg-green-100';
          borderColor = 'border-green-300';
          textColor = 'text-green-800';
          break;
        case 'OFF':
          statusText = 'LOP';
          bgColor = 'bg-red-100';
          borderColor = 'border-red-300';
          textColor = 'text-red-800';
          break;
        default:
          statusText = 'Off';
          bgColor = 'bg-slate-100';
          borderColor = 'border-slate-300';
          textColor = 'text-slate-800';
      }
      content = <div className={`font-semibold text-xs whitespace-nowrap ${textColor}`}>{statusText}</div>;
    }
  } else {
    content = <div className="text-slate-400 text-xs">Off</div>;
    bgColor = 'bg-slate-50';
    borderColor = 'border-slate-200';
    textColor = 'text-slate-400';
  }

  return (
    <div 
      onClick={handleCellClick}
      className={`p-1 sm:p-2 rounded-lg ${bgColor} ${borderColor} border w-full h-full min-h-[4rem] flex flex-col justify-center shadow-sm transition-all duration-200 ${textColor} text-center ${isEditable ? 'cursor-pointer hover:shadow-md hover:border-blue-400' : ''}`}
    >
      <div className="text-xs font-medium">{format(date, 'd')}</div>
      <div className="mt-0.5 w-full flex-1 flex flex-col justify-center">
        {content}
      </div>
    </div>
  );
};

export default MonthViewCell;
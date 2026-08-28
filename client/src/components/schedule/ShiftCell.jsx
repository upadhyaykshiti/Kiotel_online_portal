
// src/components/schedule/ShiftCell.jsx

import React, { useEffect } from 'react';
import { format } from 'date-fns';

const ShiftCell = ({
  employeeId,
  dateStr,
  scheduleEntries,
  shiftTypes,
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
  employees,
  leaveTypes,
}) => {
  const entry = scheduleEntries.find(
    (e) => Number(e.user_id) === Number(employeeId) && e.entry_date === dateStr
  );
  const isEditable = [1, 5].includes(userRole);
  const cellKey = `${employeeId}|${dateStr}`;

  const isSelectedForCurrentTemplate =
    selectedTemplate && selectedCells && selectedCells.has(cellKey);
  const isSelectedForAnyTemplate = Object.values(multiTemplateSelections || {}).some((set) =>
    set.has(cellKey)
  );

  // ==========================================================
  // ✅ Blue & Yellow Shift Color Logic
  // ==========================================================
  let assignedShiftType = null;
  let shiftColor = { bg: 'bg-white', border: 'border-gray-300', text: 'text-black' };

  // if (entry && entry.assignment_status === 'ASSIGNED') {
  //   assignedShiftType = shiftTypes.find((st) => st.id == entry.shift_type_id);
  //   const shiftName = assignedShiftType?.name || '';
    
  //   // Check if it's a Half Day shift
  //   const isHalfDay = shiftName.toLowerCase().includes('half');
    if (entry && entry.assignment_status === 'ASSIGNED') {
    assignedShiftType = shiftTypes.find((st) => st.id == entry.shift_type_id);
    const shiftName = assignedShiftType?.name || '';
    
    // Check if it's a Half Day shift OR marked as approved in DB
    const isHalfDay = shiftName.toLowerCase().includes('half') || entry.is_halfday_approved === 1 || entry.is_halfday_approved === true;
    // Check if it's an "EX" shift, "Double", or contains an underscore
    const isBlueShift = shiftName.includes('EX') || shiftName.includes('Double') || shiftName.includes('_');
    
    if (isHalfDay) {
      shiftColor = { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-900' };
    } else if (isBlueShift) {
      shiftColor = { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' };
    }
  }

  // ✅ Click to edit (only if no template selected)
  const handleCellClick = (e) => {
    e.stopPropagation();
    if (isEditable && !selectedTemplate) {
      openEditModal(employeeId, dateStr, entry);
    }
  };

  // ✅ Drag-select only in template mode
  const handleMouseDown = (e) => {
    if (isEditable && selectedTemplate) {
      e.preventDefault();
      handleDragStart(e, cellKey);
    }
  };

  // ==========================================================
  // ✅ Improved scroll: inside `.schedule-container`
  // ==========================================================
  useEffect(() => {
    if (!selectedTemplate) return;

    const container = document.querySelector('.schedule-container');
    if (!container) return;

    let isDragging = false;
    let scrollFrame;

    const scrollMargin = 80;
    const maxScrollSpeed = 30;

    const handleMouseDown = () => {
      isDragging = true;
    };

    const handleMouseUp = () => {
      isDragging = false;
      cancelAnimationFrame(scrollFrame);
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const rect = container.getBoundingClientRect();
      const y = e.clientY;
      const distanceTop = y - rect.top;
      const distanceBottom = rect.bottom - y;

      let scrollDelta = 0;

      if (distanceTop < scrollMargin && container.scrollTop > 0) {
        scrollDelta = -((scrollMargin - distanceTop) / scrollMargin) * maxScrollSpeed;
      }
      else if (distanceBottom < scrollMargin && container.scrollTop < container.scrollHeight) {
        scrollDelta = ((scrollMargin - distanceBottom) / scrollMargin) * maxScrollSpeed;
      }

      if (scrollDelta !== 0) {
        const smoothScroll = () => {
          container.scrollTop += scrollDelta;
          scrollFrame = requestAnimationFrame(smoothScroll);
        };
        cancelAnimationFrame(scrollFrame);
        scrollFrame = requestAnimationFrame(smoothScroll);
      } else {
        cancelAnimationFrame(scrollFrame);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(scrollFrame);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [selectedTemplate]);

  // 🔒 Read-only view
  if (!isEditable) {
    if (!entry) return <div className="h-20"></div>;

    let content, bgColor, borderColor, textColor = 'text-black';

    if (entry.assignment_status === 'ASSIGNED') {
      content = (
        <>
          <div className="font-semibold text-sm">{assignedShiftType?.name}</div>
          <div className="text-xs truncate mt-1">{entry.property_name}</div>
        </>
      );
      bgColor = shiftColor.bg;
      borderColor = shiftColor.border;
      textColor = shiftColor.text;
    } else {
      let statusText = '';
      switch (entry.assignment_status) {
        case 'HALF_DAY': // Fallback if half day is saved as a status
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
        case 'LLOP_EX':
          statusText = 'LLOP_EX';
          bgColor = 'bg-gray-800';
          borderColor = 'border-gray-600';
          textColor = 'text-red-400';
          break;
        default:
          statusText = 'Off';
          bgColor = 'bg-slate-100';
          borderColor = 'border-slate-300';
          textColor = 'text-slate-800';
      }
      content = <div className={`font-semibold text-sm ${textColor}`}>{statusText}</div>;
    }

    return (
      <div
        className={`p-3 rounded-xl ${bgColor} ${borderColor} border h-20 flex flex-col justify-center shadow-sm transition-all duration-200 ${textColor}`}
      >
        {content}
      </div>
    );
  }

  // 🧱 Editable View
  return (
    <div
      onClick={selectedTemplate ? undefined : handleCellClick}
      onMouseDown={handleMouseDown}
      className={`h-20 cursor-pointer transition-all duration-200 rounded-xl p-1 flex items-center justify-center group schedule-cell ${
        isSelectedForCurrentTemplate
          ? 'bg-blue-500 hover:bg-blue-600'
          : isSelectedForAnyTemplate
          ? 'bg-green-500 hover:bg-green-600'
          : 'hover:bg-slate-100'
      }`}
      data-cell-key={cellKey}
    >
      {entry ? (
        entry.assignment_status === 'ASSIGNED' ? (
          <div
            className={`p-3 rounded-xl w-full h-full flex flex-col justify-center ${
              isSelectedForCurrentTemplate
                ? 'bg-white border border-blue-400 text-black shadow-inner'
                : isSelectedForAnyTemplate
                ? 'bg-white border border-green-400 text-black shadow-inner'
                : `${shiftColor.bg} border ${shiftColor.border} ${shiftColor.text}`
            } shadow-sm group-hover:shadow-md transition-shadow`}
          >
            <div className="font-semibold text-sm">
              {assignedShiftType?.name}
            </div>
            <div className="text-xs truncate mt-1">{entry.property_name}</div>
          </div>
        ) : (
          <div
            className={`p-3 rounded-xl w-full h-full flex flex-col justify-center shadow-sm group-hover:shadow-md transition-shadow ${
              entry.assignment_status === 'HALF_DAY'
                ? 'bg-yellow-100 border border-yellow-400 text-yellow-900'
                : entry.assignment_status === 'PTO_REQUESTED'
                ? 'bg-gray-800 border border-gray-600 text-red-400'
                : entry.assignment_status === 'PTO_APPROVED'
                ? 'bg-purple-100 border border-purple-300 text-purple-800'
                : entry.assignment_status === 'LLOP_EX'
                ? 'bg-gray-800 border border-gray-600 text-red-400'
                : entry.assignment_status === 'FESTIVE_LEAVE'
                ? 'bg-pink-100 border border-pink-300 text-pink-800'
                : entry.assignment_status === 'UNAVAILABLE'
                ? 'bg-green-100 border border-green-300 text-green-800'
                : entry.assignment_status === 'OFF'
                ? 'bg-red-100 border border-red-300 text-red-800'
                : 'bg-slate-100 border border-slate-300 text-slate-800'
            } ${isSelectedForCurrentTemplate ? 'text-white' : ''}`}
          >
            <div className="font-semibold text-sm">
              {entry.assignment_status === 'HALF_DAY'
                ? 'Half Day'
                : entry.assignment_status === 'PTO_REQUESTED'
                ? 'LLOP'
                : entry.assignment_status === 'PTO_APPROVED'
                ? 'Paid Leave'
                : entry.assignment_status === 'LLOP_EX'
                ? 'LLOP EX'
                : entry.assignment_status === 'FESTIVE_LEAVE'
                ? 'Festive leave'
                : entry.assignment_status === 'UNAVAILABLE'
                ? 'Week OFF'
                : entry.assignment_status === 'OFF'
                ? 'LOP'
                : 'Off'}
            </div>
            <div className="text-xs truncate mt-1">{entry.property_name}</div>
          </div>
        )
      ) : (
        <div
          className={`w-full h-full text-slate-400 text-sm border-2 border-dashed ${
            isSelectedForCurrentTemplate
              ? 'border-blue-400 bg-blue-50'
              : isSelectedForAnyTemplate
              ? 'border-green-400 bg-green-50'
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
          } rounded-xl flex items-center justify-center transition-colors cursor-pointer`}
        >
          <div className="text-center">
            <div className="text-lg">+</div>
            <div>Add Shift</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftCell;
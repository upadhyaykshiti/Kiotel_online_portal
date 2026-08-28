


// src/components/schedule/ScheduleMainView.jsx
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { format, isToday, subDays, addDays, startOfWeek, startOfDay, eachDayOfInterval, parseISO } from 'date-fns';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableEmployeeRow from './SortableEmployeeRow';
import ScheduleTableHeader from './ScheduleTableHeader';
import MonthView from './MonthView';
import ThreeMonthView from './ThreeMonthView';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const ScheduleMainView = ({
  currentSchedule, isMonthView, setIsMonthView, isDayView, setIsDayView,
  selectedDate, setSelectedDate, selectedWeekStart, setSelectedWeekStart,
  selectedMonth, setSelectedMonth, employeeSearch, setEmployeeSearch,
  orderedEmployees, filteredEmployees, scheduleEntries, shiftTypes,
  openEditModal, userRole, moveEmployee, duplicateShiftForWeek,
  handleReorder, loadScheduleEntries, myPastEntries, uniqueId,
  selectedTemplate, setSelectedTemplate, selectedCells, setSelectedCells,
  applySelectedTemplateToCells, employeeRoles, showBroadcastModal,
  setShowBroadcastModal, multiTemplateSelections, setMultiTemplateSelections,
  saveAllMultiTemplateSelections, applyTemplateToAllDaysForEmployee,
  employees, leaveTypes, isThreeMonthView, setIsThreeMonthView,
  allPastEntries, threeMonthLoading,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState(null);
  const tableBodyRef = useRef(null);

  // ✅ New Search State Logic
  const [highlightSearch, setHighlightSearch] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const matches = useMemo(() => {
    if (!highlightSearch.trim()) return [];
    const searchLower = highlightSearch.toLowerCase();
    return filteredEmployees.filter(emp =>
      emp.first_name.toLowerCase().includes(searchLower) ||
      emp.last_name.toLowerCase().includes(searchLower)
    );
  }, [highlightSearch, filteredEmployees]);

  const activeMatchId = matches[currentMatchIndex]?.id;

  useEffect(() => {
    if (matches.length > 0) {
      const match = matches[currentMatchIndex];
      if (match) {
        setTimeout(() => {
          const row = document.querySelector(`tr[data-employee-id="${match.id}"]`);
          if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 50); // slight delay to allow rendering
      }
    }
  }, [currentMatchIndex, matches, isThreeMonthView, isDayView]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (matches.length > 0) {
        setCurrentMatchIndex(prev => (prev + 1) % matches.length);
      }
    }
  };

  const downloadScheduleData = async () => {
    // ... (Your existing download logic remains exactly the same here) ...
  };

  const getDaysOfWeek = (baseDate) => {
    if (isDayView) {
      return [startOfDay(baseDate)];
    } else {
      if (currentSchedule && currentSchedule.start_date && currentSchedule.end_date) {
        const startDate = parseISO(currentSchedule.start_date);
        const endDate = parseISO(currentSchedule.end_date);
        return eachDayOfInterval({ start: startDate, end: endDate });
      } else {
        const start = startOfWeek(baseDate, { weekStartsOn: 0 });
        return Array.from({ length: 7 }, (_, i) => {
          const day = new Date(start);
          day.setDate(start.getDate() + i);
          return day;
        });
      }
    }
  };

  const weekDays = useMemo(() => getDaysOfWeek(isDayView ? selectedDate : selectedWeekStart), [isDayView, selectedDate, selectedWeekStart, currentSchedule]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = filteredEmployees.findIndex(emp => emp.id === active.id);
      const newIndex = filteredEmployees.findIndex(emp => emp.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        handleReorder(oldIndex, newIndex);
      }
    }
  };

  const handleMultiTemplateSelection = (cellKey, templateId) => {
    if (!templateId) return;
    setMultiTemplateSelections(prev => {
      const newSelections = { ...prev };
      if (!newSelections[templateId]) {
        newSelections[templateId] = new Set();
      }
      if (newSelections[templateId].has(cellKey)) {
        newSelections[templateId].delete(cellKey);
      } else {
        newSelections[templateId].add(cellKey);
      }
      return newSelections;
    });

    setSelectedCells(prev => {
      const newSet = new Set(prev);
      const isSelected = multiTemplateSelections[templateId]?.has(cellKey);
      if (isSelected) {
        newSet.delete(cellKey);
      } else {
        newSet.add(cellKey);
      }
      return newSet;
    });
  };

  const handleDragStart = (e, cellKey) => {
    if (!selectedTemplate) return;
    setIsDragging(true);
    setDragStartCell(cellKey);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !dragStartCell || !selectedTemplate) return;

    const cellElements = document.querySelectorAll('.schedule-cell');
    const draggedOverCells = [];

    cellElements.forEach(cell => {
      const rect = cell.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        draggedOverCells.push(cell);
      }
    });

    if (draggedOverCells.length > 0) {
      const firstCellKey = draggedOverCells[0].dataset.cellKey;
      const lastCellKey = draggedOverCells[draggedOverCells.length - 1].dataset.cellKey;

      const allCellKeys = new Set();
      const [startEmpId, startDateStr] = dragStartCell.split('|');
      const [endEmpId, endDateStr] = lastCellKey.split('|');

      const allEmployeeIds = filteredEmployees.map(emp => emp.id);
      const startEmpIndex = allEmployeeIds.indexOf(parseInt(startEmpId));
      const endEmpIndex = allEmployeeIds.indexOf(parseInt(endEmpId));

      const startDayIndex = weekDays.findIndex(day => format(day, 'yyyy-MM-dd') === startDateStr);
      const endDayIndex = weekDays.findIndex(day => format(day, 'yyyy-MM-dd') === endDateStr);

      for (let i = Math.min(startEmpIndex, endEmpIndex); i <= Math.max(startEmpIndex, endEmpIndex); i++) {
        for (let j = Math.min(startDayIndex, endDayIndex); j <= Math.max(startDayIndex, endDayIndex); j++) {
          const empId = allEmployeeIds[i];
          const dateStr = format(weekDays[j], 'yyyy-MM-dd');
          allCellKeys.add(`${empId}|${dateStr}`);
        }
      }

      setMultiTemplateSelections(prev => {
        const newSelections = { ...prev };
        if (!newSelections[selectedTemplate.id]) {
          newSelections[selectedTemplate.id] = new Set();
        }
        newSelections[selectedTemplate.id] = new Set(allCellKeys);
        return newSelections;
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStartCell(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartCell, selectedTemplate, weekDays, filteredEmployees]);

  if (!currentSchedule && !isMonthView && !isThreeMonthView) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-6 flex items-center justify-center min-h-[300px] sm:min-h-[500px]">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-700">No Live Schedule Available</h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            There is no active schedule for you to view at this time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-7">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 break-words">
            {isThreeMonthView
              ? 'Full Schedule - Last 3 Months'
              : isMonthView
              ? `My Schedule - ${format(selectedMonth, 'MMMM yyyy')}`
              : (currentSchedule ? currentSchedule.name : 'Full Schedule')}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-wrap">
          {([1, 5].includes(userRole)) && (
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={() => setShowBroadcastModal(true)}
                className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-md"
              >
                Broadcast
              </button>
              {currentSchedule && !isMonthView && !isThreeMonthView && (
                <button
                  onClick={downloadScheduleData}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-md"
                >
                  Download
                </button>
              )}
            </div>
          )}
          
          <div className="flex border border-slate-300 rounded-xl overflow-hidden w-full sm:w-auto">
            <button
              onClick={() => { setIsDayView(false); setIsMonthView(false); setIsThreeMonthView(false); }}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                !isDayView && !isMonthView && !isThreeMonthView ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >Week</button>
            <button
              onClick={() => { setIsDayView(true); setIsMonthView(false); setIsThreeMonthView(false); }}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                isDayView && !isMonthView && !isThreeMonthView ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >Day</button>
            <button
              onClick={() => { setIsDayView(false); setIsMonthView(false); setIsThreeMonthView(true); }}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                isThreeMonthView ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >Month</button>
          </div>
        </div>
      </div>

      {/* ✅ Display search bar in ALL views EXCEPT Personal Month View */}
      {!isMonthView && (
        <div className="mb-4 sm:mb-6 relative">
          <input
            type="text"
            placeholder="Search to find employee (Press Enter to go to next)..."
            value={highlightSearch}
            onChange={(e) => {
              setHighlightSearch(e.target.value);
              setCurrentMatchIndex(0);
            }}
            onKeyDown={handleSearchKeyDown}
            className="w-full p-2 sm:p-3 pr-24 border border-slate-300 rounded-xl text-sm sm:text-base text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {highlightSearch.trim() !== '' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5 text-sm text-slate-600 bg-white px-2 py-1 rounded shadow-sm border border-slate-200">
              <span className="font-semibold text-xs min-w-[30px] text-center">
                {matches.length > 0 ? currentMatchIndex + 1 : 0} / {matches.length}
              </span>
              <div className="flex flex-col gap-0 border-l pl-1 ml-1 border-slate-200">
                <button onClick={() => setCurrentMatchIndex(prev => prev > 0 ? prev - 1 : matches.length - 1)} className="hover:bg-slate-100 px-1 rounded text-[10px] leading-none py-0.5">▲</button>
                <button onClick={() => setCurrentMatchIndex(prev => (prev + 1) % matches.length)} className="hover:bg-slate-100 px-1 rounded text-[10px] leading-none py-0.5">▼</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* (Save templates buttons logic) */}
      {([1, 5].includes(userRole) && currentSchedule && selectedTemplate && applySelectedTemplateToCells && !isThreeMonthView) && (
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-slate-50 rounded-xl">
           <button onClick={saveAllMultiTemplateSelections} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm">Save All Shifts</button>
        </div>
      )}

      {isThreeMonthView ? (
        <ThreeMonthView
          allPastEntries={allPastEntries}
          scheduleEntries={scheduleEntries}
          employees={employees}
          shiftTypes={shiftTypes}
          leaveTypes={leaveTypes}
          loading={threeMonthLoading}
          employeeRoles={employeeRoles}
          openEditModal={openEditModal}
          userRole={userRole}
          currentSchedule={currentSchedule}
          employeeSearch={highlightSearch}   // ✅ Pass search state
          activeMatchId={activeMatchId}      // ✅ Pass active match
        />
      ) : isMonthView ? (
        <MonthView
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          myPastEntries={myPastEntries}
          shiftTypes={shiftTypes}
          uniqueId={uniqueId}
          openEditModal={openEditModal}
          userRole={userRole}
          currentSchedule={currentSchedule}
        />
      ) : (
        <>
          <div className="overflow-x-auto overflow-y-auto w-full max-h-[60vh]">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <table className="border-collapse min-w-full" style={{ width: 'max-content' }}>
                <thead className="sticky top-0 z-20">
                  <ScheduleTableHeader weekDays={weekDays} />
                </thead>
                <tbody ref={tableBodyRef}>
                  <SortableContext items={filteredEmployees.map(emp => emp.id)} strategy={verticalListSortingStrategy}>
                    {filteredEmployees.map((emp, idx) => (
                      <SortableEmployeeRow
                        key={emp.id}
                        emp={emp}
                        idx={idx}
                        orderedEmployees={filteredEmployees}
                        userRole={userRole}
                        currentSchedule={currentSchedule}
                        moveEmployee={moveEmployee}
                        duplicateShiftForWeek={duplicateShiftForWeek}
                        weekDays={weekDays}
                        handleReorder={handleReorder}
                        isDayView={isDayView}
                        scheduleEntries={scheduleEntries}
                        shiftTypes={shiftTypes}
                        openEditModal={openEditModal}
                        selectedTemplate={selectedTemplate}
                        setSelectedCells={setSelectedCells}
                        selectedCells={selectedCells}
                        employeeRoles={employeeRoles}
                        multiTemplateSelections={multiTemplateSelections}
                        handleMultiTemplateSelection={handleMultiTemplateSelection}
                        applyTemplateToAllDaysForEmployee={applyTemplateToAllDaysForEmployee}
                        isDragging={isDragging}
                        handleDragStart={handleDragStart}
                        employees={employees}
                        leaveTypes={leaveTypes}
                        employeeSearch={highlightSearch} // ✅ Search state
                        activeMatchId={activeMatchId}    // ✅ Active match
                      />
                    ))}
                  </SortableContext>
                </tbody>
              </table>
            </DndContext>
          </div>
        </>
      )}
    </div>
  );
};

export default ScheduleMainView;
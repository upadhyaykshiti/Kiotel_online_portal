

// src/components/schedule/SortableEmployeeRow.jsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ShiftCell from './ShiftCell';
import { format } from 'date-fns';

const ROLE_MAP = {
  1: "Admin", 2: "Agent", 3: "Manager", 4: "Client",
  5: "HR", 6: "Office Admin", 7: "Agent Trainee",
};

const SortableEmployeeRow = ({
  emp, idx, orderedEmployees, userRole, currentSchedule,
  moveEmployee, duplicateShiftForWeek, weekDays, handleReorder,
  isDayView, scheduleEntries, shiftTypes, openEditModal,
  selectedTemplate, setSelectedCells, selectedCells, employeeRoles,
  multiTemplateSelections, handleMultiTemplateSelection,
  applyTemplateToAllDaysForEmployee, isDragging, handleDragStart,
  employees, leaveTypes, isSeparator, toggleSeparator,
  employeeSearch, activeMatchId // ✅ Received new prop
}) => {
  
  const safeEmp = emp || {};
  const empId = safeEmp.id || `fallback-${idx}`;
  const firstName = safeEmp.first_name || '';
  const lastName = safeEmp.last_name || '';
  const uniqueId = safeEmp.unique_id || '';

  const searchLower = employeeSearch ? employeeSearch.toLowerCase() : '';
  const isMatch = searchLower.trim() !== '' && (
    firstName.toLowerCase().includes(searchLower) ||
    lastName.toLowerCase().includes(searchLower)
  );
  
  // ✅ Check if this is the currently focused match from Next/Prev buttons
  const isActiveMatch = activeMatchId === empId;

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging: sortableIsDragging,
  } = useSortable({ id: empId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: sortableIsDragging ? 0.5 : 1,
    zIndex: sortableIsDragging ? 1000 : 1,
    position: 'relative',
  };

  const canEdit = [1, 5].includes(userRole) && currentSchedule;
  const employeeData = (employeeRoles && employeeRoles[uniqueId]) ? employeeRoles[uniqueId] : {};
  const employeeRoleName = employeeData.role || null;
  const isAgentTrainee = employeeRoleName === ROLE_MAP[7];

  const formatDBDate = (dateVal) => {
    if (!dateVal) return null;
    try { return format(new Date(dateVal), 'yyyy-MM-dd'); } catch (e) { return dateVal.toString().substring(0, 10); }
  };

  const empDob = formatDBDate(employeeData.dob || safeEmp.dob);
  const empLastTraining = formatDBDate(employeeData.last_training || safeEmp.last_training);

  const isDateYellow = (dateStr) => {
    if (empLastTraining) {
      const isAfterJoining = !empDob || dateStr >= empDob;
      const isBeforeOrOnLastTraining = dateStr <= empLastTraining;
      return isAfterJoining && isBeforeOrOnLastTraining;
    }
    return isAgentTrainee;
  };

  const isEmployeeNameYellow = empLastTraining 
    ? (weekDays || []).some(d => isDateYellow(format(d, 'yyyy-MM-dd')))
    : isAgentTrainee;

  if (!safeEmp.id) return <tr style={{ display: 'none' }}></tr>;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`transition-colors ${
        isSeparator ? 'border-b-[6px] border-b-slate-400' : 'border-b border-slate-200'
      } ${isActiveMatch ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
      data-employee-id={empId}
    >
      <td
        // ✅ Add heavy ring shadow to active match, lighter color for other matches
        className={`border-r border-slate-200 ${isActiveMatch ? 'ring-2 ring-inset ring-blue-600 shadow-lg' : ''}`}
        style={{
          position: 'sticky', left: 0, zIndex: isActiveMatch ? 20 : 10,
          width: '130px', minWidth: '130px', maxWidth: '130px', padding: '8px',
          backgroundColor: isActiveMatch ? '#bae6fd' : (isMatch ? '#e0f2fe' : (isEmployeeNameYellow ? '#fef08a' : '#ffffff')),
          cursor: canEdit ? 'grab' : 'default',
        }}
        {...listeners}
        {...attributes}
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
            {firstName.charAt(0)}{lastName.charAt(0)}
          </div>
          <div className="w-full">
            <div className={`font-semibold leading-tight ${isMatch ? 'text-blue-900' : 'text-slate-800'}`} style={{ fontSize: '17px', wordBreak: 'break-word' }}>
              {firstName} {lastName}
            </div>
          </div>
          {/* Action buttons... */}
        </div>
      </td>

      {(weekDays || []).map(d => {
        const utcDateStr = format(d, 'yyyy-MM-dd');
        const entryForDay = scheduleEntries?.find(e => e.user_id == empId && e.entry_date === utcDateStr);

        let isHalfDay = false;
        if (entryForDay) {
          if (entryForDay.assignment_status === 'HALF_DAY' || entryForDay.is_halfday_approved === 1 || entryForDay.is_halfday_approved === true) {
            isHalfDay = true;
          } else if (entryForDay.assignment_status === 'ASSIGNED' && entryForDay.shift_type_id) {
            const st = shiftTypes?.find(s => s.id === entryForDay.shift_type_id);
            if (st && String(st.name).toLowerCase().includes('half')) {
              isHalfDay = true;
            }
          }
        }

        const cellBgClass = isHalfDay 
          ? '!bg-yellow-200' 
          : (isDateYellow(utcDateStr) ? 'bg-yellow-100' : '');

        return (
          <td key={utcDateStr} className={`border-r border-slate-200 p-1.5 ${cellBgClass}`} style={{ width: '110px', minWidth: '110px' }}>
            <ShiftCell
              employeeId={empId} dateStr={utcDateStr} scheduleEntries={scheduleEntries} shiftTypes={shiftTypes}
              openEditModal={openEditModal} userRole={userRole} currentSchedule={currentSchedule}
              selectedTemplate={selectedTemplate} setSelectedCells={setSelectedCells} selectedCells={selectedCells}
              multiTemplateSelections={multiTemplateSelections} handleMultiTemplateSelection={handleMultiTemplateSelection}
              isDragging={isDragging} handleDragStart={handleDragStart} employees={employees} leaveTypes={leaveTypes}
            />
          </td>
        );
      })}
    </tr>
  );
};

export default SortableEmployeeRow;
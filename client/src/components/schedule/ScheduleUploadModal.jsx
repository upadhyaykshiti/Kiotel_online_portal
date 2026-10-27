// src/components/schedule/ScheduleUploadModal.jsx
import React, { useState } from 'react';
import { read, utils } from 'xlsx'; // Import xlsx functions

const ScheduleUploadModal = ({ 
  isOpen, 
  onClose, 
  currentSchedule, 
  employees, 
  shiftTypes, 
  leaveTypes, 
  setScheduleEntries, 
  setFilteredEmployees, // If filtering is applied based on entries
  setOrderedEmployees,  // If ordering is applied based on entries
  uniqueId, // Add uniqueId prop
  API // Add API base URL prop
}) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid Excel (.xlsx) or CSV file.');
      setFile(null);
    }
  };

  // --- NEW: Function to Save Schedule Entries to Backend ---
  const saveScheduleEntriesToBackend = async (entries) => {
    if (!currentSchedule || !uniqueId) {
      console.error("Current schedule or uniqueId is missing for saving.");
      throw new Error("Cannot save schedule: Missing schedule ID or unique ID.");
    }

    // The API endpoint expects an array of entries to create/update.
    // We assume the backend handles upserts (create if new, update if exists) based on schedule_id, user_id, and entry_date.
        // The API endpoint expects an object with an 'entries' key containing the array.
    const payload = {
      entries: entries.map(entry => ({
        schedule_id: currentSchedule.id, // Ensure schedule ID is included
        employee_unique_id: employees.find(e => e.id == entry.user_id)?.unique_id, // Map user_id to unique_id for backend
        entry_date: entry.entry_date,
        assignment_status: entry.assignment_status,
        property_name: entry.property_name || '', // Ensure string, might be empty
        shift_type_id: entry.shift_type_id, // Can be null for leaves/unassigned
      }))
    };

    try {
      // Assuming the backend endpoint is `/api/schedule-entries/bulk-update` or similar.
      // You might need to adjust the endpoint URL based on your actual API.
      // This example uses a POST request to a bulk endpoint.
      // Alternatively, you might have a PUT request to `/api/schedules/{scheduleId}/entries`.
      const response = await fetch(`${API}/api/schedule-entries/bulk`, { // Adjust URL as needed
        method: 'POST', // Or 'PUT'
        headers: {
          'Content-Type': 'application/json',
          'X-Unique-ID': uniqueId, // Include the unique ID header
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Schedule entries saved to backend successfully:", result);
      return result; // Return result if needed
      } catch (err) {
      console.error("Error saving schedule entries to backend:", err);
      throw err; // Re-throw to be caught by the upload handler
    }
  };
  // --- END NEW ---
//
  const handleUpload = async () => {
    if (!file || !currentSchedule) {
      setError('No file selected or no schedule loaded.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = utils.sheet_to_json(worksheet, { header: 1 }); // Get as array of arrays

      if (jsonData.length < 2) {
        throw new Error('Uploaded file does not contain sufficient data.');
      }

      // const headerRow = jsonData[0];
      // const dataRows = jsonData.slice(1);

      // if (headerRow.length < 2 || headerRow[0] !== 'Employee Name') {
      //    throw new Error('Invalid file format: Expected "Employee Name" as the first column.');
      // }

      // --- UPDATED: Find the header row dynamically ---
      let headerRowIndex = -1;
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        // Look for the first row where the first cell is "Employee Name"
        if (row && row.length > 0 && row[0] === 'Employee Name') {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        throw new Error('Invalid file format: Expected "Employee Name" as the first column in a header row.');
      }

      const headerRow = jsonData[headerRowIndex];
      const dataRows = jsonData.slice(headerRowIndex + 1); // Data rows come after the header

      if (headerRow.length < 2) {
         throw new Error('Invalid file format: Header row does not contain sufficient columns.');
      }


      const dates = headerRow.slice(1); // Dates are from the second column onwards
      const employeeMap = new Map(employees.map(emp => [`${emp.first_name} ${emp.last_name}`, emp.id]));
      const shiftTypeMap = new Map(shiftTypes.map(st => [st.name, st.id]));
      const leaveTypeMap = new Map(leaveTypes.map(lt => [lt.name, lt.id]));

      const newScheduleEntries = [];
      const errors = [];

      dataRows.forEach((row, rowIndex) => {
        if (row.length < 2) return; // Skip empty rows or rows with only employee name

        const empName = row[0];
        const empId = employeeMap.get(empName);

        if (!empId) {
            errors.push(`Row ${rowIndex + 2}: Employee "${empName}" not found in system.`);
            return; // Skip this row
        }

        dates.forEach((date, colIndex) => {
          const cellValue = row[colIndex + 1]; // +1 because first column is employee name
          if (!date || cellValue === undefined || cellValue === null || cellValue === '') {
              // No value for this date, could mean unassigned or no entry needed
              // We might still want an entry record for consistency, perhaps with 'UNASSIGNED'
              // For now, let's skip if empty, assuming no entry means unassigned
              return;
          }

          let assignmentStatus = 'UNASSIGNED'; // Default
          let shiftTypeId = null;
          let propertyName = ''; // Can be derived from cell value if needed, often kept empty for shifts/leaves

          // Determine assignment type based on cell value
          if (shiftTypeMap.has(cellValue)) {
            assignmentStatus = 'ASSIGNED';
            shiftTypeId = shiftTypeMap.get(cellValue);
          } else if (leaveTypeMap.has(cellValue)) {
            assignmentStatus = leaveTypeMap.get(cellValue); // assignment_status will be the leave ID
            shiftTypeId = null; // No shift type for leaves
          } else if (cellValue.toLowerCase() === 'unassigned') {
              assignmentStatus = 'UNASSIGNED';
              shiftTypeId = null;
          } else {
              // If value doesn't match known shifts/leaves, treat as unassigned or log error
              console.warn(`Unknown shift/leave value "${cellValue}" for ${empName} on ${date}. Treating as unassigned.`);
              // assignmentStatus remains 'UNASSIGNED', shiftTypeId remains null
          }

          // Find existing entry ID if it exists for this emp+date, or use a temporary ID if creating new
          // For simplicity in this client-side update, we'll assume new structure or use a placeholder
          // In a real scenario, you might need to fetch existing IDs or handle updates differently
          // For now, we'll construct an object similar to what the API returns, without 'id' if it's new
          // Or, if we are replacing all entries, we just create the new list.
          // Let's assume we are replacing the entries list based on the upload.
          // We'll add an object representing this cell's assignment.
          // Note: unique_id might be needed depending on how backend handles updates vs. creates.
          // For simplicity here, we focus on user_id, date, status, shift_type_id.
          newScheduleEntries.push({
            user_id: empId,
            entry_date: date, // Ensure date format is 'YYYY-MM-DD' if backend expects it
            assignment_status: assignmentStatus,
            property_name: propertyName,
            shift_type_id: shiftTypeId,
            // Note: unique_id, schedule_id might need to be added depending on backend expectation
            // If backend requires schedule_id, it should be added: schedule_id: currentSchedule.id
            schedule_id: currentSchedule.id // Add schedule ID
            // id: ... // The backend usually provides this on create, might not be relevant here if replacing whole schedule data
          });
        });
      });

      if (errors.length > 0) {
        setError(errors.join('\n'));
        setLoading(false);
        return; // Stop if there are data errors
      }

      // Update the parent component's state with the new entries
      // This will trigger a re-render of the schedule view
      setScheduleEntries(newScheduleEntries);

      // Optionally, also update filtered/ordered employees if the new entries affect them
      // This depends on how your filtering/ordering logic works.
      // If employees are just displayed based on entries, this might not be necessary.
      // If filtering/ordering depends on *new* entries that weren't present before,
      // you might need to re-run the logic that sets filteredEmployees/orderedEmployees.
      // For now, let's assume the display updates based on setScheduleEntries alone.

      // --- NEW: Attempt to save the new entries to the backend ---
      console.log("Attempting to save uploaded entries to backend...");
      await saveScheduleEntriesToBackend(newScheduleEntries);
      console.log("Entries saved to backend successfully.");

      console.log("Schedule entries updated from uploaded file:", newScheduleEntries);
      alert("Schedule updated successfully from uploaded file!");
      onClose(); // Close the modal after successful upload

    } catch (err) {
      console.error("Error processing uploaded file:", err);
      setError(`Error processing file: ${err.message || 'An unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h3 className="font-bold text-xl text-slate-800 mb-4">Upload Schedule File</h3>
        <p className="text-sm text-slate-600 mb-4">
          Upload an Excel (.xlsx) or CSV file to update the current schedule ({currentSchedule?.name}).
          The file should have Employee Name as the first column and dates as subsequent columns.
          Cell values should match Shift/Leave type names configured in the system.
        </p>
        <input
          type="file"
          accept=".xlsx, .csv"
          onChange={handleFileChange}
          className="w-full border border-slate-300 rounded-lg p-2 mb-4"
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-md ${(!file || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-700 hover:to-indigo-800'}`}
          >
            {loading ? 'Uploading...' : 'Upload & Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleUploadModal;
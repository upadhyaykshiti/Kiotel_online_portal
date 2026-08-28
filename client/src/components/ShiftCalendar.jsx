"use client";

import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ShiftFormModal from "./ShiftFormModal";

export default function ShiftCalendar() {
  const [events, setEvents] = useState([
    {
      title: "Morning Shift - John",
      start: new Date(2025, 3, 5, 8, 0),
      end: new Date(2025, 3, 5, 16, 0),
    },
    {
      title: "Night Shift - Alice",
      start: new Date(2025, 3, 6, 20, 0),
      end: new Date(2025, 3, 7, 4, 0),
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateClick = (arg) => {
    setSelectedDate(arg.date);
    setIsModalOpen(true);
  };

  const handleSaveShift = (newShift) => {
    setEvents((prev) => [...prev, newShift]);
  };

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Shift Allotment</h2>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek,dayGridDay",
        }}
        events={events}
        selectable={true}
        select={handleDateClick}
      />

      {isModalOpen && (
        <ShiftFormModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveShift}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}
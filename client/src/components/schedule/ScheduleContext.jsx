// src/components/schedule/ScheduleContext.jsx
import React, { createContext, useContext } from 'react';

const ScheduleContext = createContext();

export const ScheduleProvider = ({ children, value }) => {
  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};

// Custom hook to consume the context easily within schedule components
export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
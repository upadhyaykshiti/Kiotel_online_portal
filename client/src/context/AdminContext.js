// src/app/custAdmin/AdminContext.js
'use client';
import { createContext, useContext } from 'react';

export const AdminContext = createContext(null);

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminLayout');
  return ctx;
};

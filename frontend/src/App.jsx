import React from 'react';
import { Outlet } from 'react-router-dom';

export default function App({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {children || <Outlet />}
    </div>
  );
}

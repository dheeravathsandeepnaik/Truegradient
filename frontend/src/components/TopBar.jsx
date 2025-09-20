import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleNotification } from '../features/ui/uiSlice.js';

export default function TopBar() {
  const { credits } = useSelector((s) => s.ui);
  const dispatch = useDispatch();

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white shadow">
      <div className="text-xl font-semibold">Chat App</div>
      <div className="flex items-center gap-4">
        <div className="px-3 py-1 rounded-full bg-gray-100">{credits} ✦</div>
        <button onClick={() => dispatch(toggleNotification())} className="p-2 hover:bg-gray-100 rounded">
          🔔
        </button>
      </div>
    </div>
  );
}

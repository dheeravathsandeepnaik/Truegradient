import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../api/axios.js';
import { fetchNotifications } from '../features/ui/uiSlice.js';

export default function NotificationPanel() {
  const { notifications } = useSelector((s) => s.ui);
  const dispatch = useDispatch();

  const markRead = async (id) => {
    await api.post(`/api/notifications/${id}/read`);
    dispatch(fetchNotifications());
  };

  return (
    <div className="fixed right-6 top-16 w-96 bg-white shadow-lg rounded p-4 z-50">
      <h4 className="font-semibold mb-3">Notifications</h4>
      {notifications.length === 0 ? (
        <p className="text-sm text-gray-500">No notifications</p>
      ) : (
        notifications.map((n) => (
          <div key={n.id} className="flex justify-between items-center border-b py-2">
            <span>{n.message}</span>
            {!n.is_read && (
              <button onClick={() => markRead(n.id)} className="text-xs text-blue-500">
                Mark read
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

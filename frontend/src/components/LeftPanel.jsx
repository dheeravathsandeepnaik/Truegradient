import React from 'react';

export default function LeftPanel() {
  return (
    <div className="w-64 bg-slate-50 border-r p-4">
      <button className="w-full bg-blue-500 text-white py-2 rounded mb-4">+ New Chat</button>
      <div className="text-sm text-gray-400">Conversations</div>
      <p className="text-sm text-gray-500 mt-2">No chats yet</p>
    </div>
  );
}

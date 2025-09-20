import React, { useState } from 'react';
import api from '../api/axios.js';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await api.post('/api/chat/send', { message: text });
    setMessages((prev) => [...prev, { from: 'me', text }, { from: 'bot', text: res.data.message }]);
    setText('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 border rounded p-4 overflow-auto mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.from === 'me' ? 'text-right' : 'text-left'}`}>
            <span className="inline-block bg-gray-100 rounded px-3 py-1">{m.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border rounded p-2"
          placeholder="Type a message..."
        />
        <button className="bg-blue-500 text-white px-4 rounded">Send</button>
      </form>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiMessageSquare, FiPlus, FiChevronDown, FiChevronLeft, FiBell, FiUser, FiSend, FiCheckCircle, FiThumbsUp, FiThumbsDown, FiCopy, FiMoreHorizontal, FiRefreshCcw } from 'react-icons/fi';
import api from '../api/axios.js';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice.js';

export default function Chat() {
  const [input, setInput] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]); // {id, title, messages, updatedAt}
  const [activeId, setActiveId] = useState(null);
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const unreadCount = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications]);

  const defaultNotifications = [
    {
      id: 'welcome',
      message: 'Welcome to AI Chat. You have 1,250 credits to start with.',
      title: 'Welcome!',
      is_read: false,
      created_at: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    },
    {
      id: 'feature',
      message: 'New conversation export feature is now available.',
      title: 'Feature Update',
      is_read: false,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Persist conversations to localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('tg_conversations');
      if (raw) {
        const parsed = JSON.parse(raw);
        setConversations(parsed);
        if (parsed.length > 0) {
          setActiveId(parsed[0].id);
          setMessages(parsed[0].messages || []);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('tg_conversations', JSON.stringify(conversations));
    } catch {}
  }, [conversations]);

  const selectConversation = (id) => {
    setActiveId(id);
    const c = conversations.find((x) => x.id === id);
    setMessages(c ? c.messages : []);
  };

  const newConversation = () => {
    const id = crypto.randomUUID();
    const conv = { id, title: 'New conversation', messages: [], updatedAt: new Date().toISOString() };
    setConversations((cs) => [conv, ...cs]);
    setActiveId(id);
    setMessages([]);
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      const serverNotes = res.data.notifications || [];
      if (serverNotes.length === 0) {
        // Fallback to default texts per spec
        setNotifications(defaultNotifications);
      } else {
        setNotifications(serverNotes);
      }
    } catch (e) {
      // Fallback to default texts if server not available
      setNotifications(defaultNotifications);
    }
  };

  useEffect(() => {
    // fetch on mount so badge shows right after sign-in
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (isNotifOpen) fetchNotifications();
  }, [isNotifOpen]);

  const markAllRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.is_read);
      if (unread.length > 0 && unread[0].id !== 'welcome' && unread[0].id !== 'feature') {
        await Promise.all(unread.map((n) => api.post(`/api/notifications/${n.id}/read`)));
        await fetchNotifications();
      } else {
        // local-only default notifications
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch (e) {
      // ignore
    }
  };

  const formatTime = (date) => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      return `${hours}:${minutes} ${ampm}`;
    } catch {
      return '';
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const now = new Date();
    const userMsg = { role: 'user', content: text, id: crypto.randomUUID(), createdAt: now.toISOString() };
    // ensure active conversation exists
    let cid = activeId;
    if (!cid) {
      cid = crypto.randomUUID();
      const newConv = {
        id: cid,
        title: text.slice(0, 40),
        messages: [userMsg],
        updatedAt: now.toISOString(),
      };
      setConversations((cs) => [newConv, ...cs]);
      setActiveId(cid);
      setMessages([userMsg]);
    } else {
      setMessages((m) => [...m, userMsg]);
      setConversations((cs) => cs.map((c) => {
        if (c.id !== cid) return c;
        const shouldRename = !c.title || c.title === 'New conversation';
        return {
          ...c,
          messages: [...c.messages, userMsg],
          updatedAt: now.toISOString(),
          title: shouldRename ? text.slice(0, 40) : c.title,
        };
      }));
    }
    setInput('');
    const assistantText = 'I understand your question. Let me help you with that... This is a mock response to demonstrate the chat functionality. In a real application, this would be connected to an actual AI service.';
    const assistantMsg = { role: 'assistant', content: assistantText, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setTimeout(() => {
      setMessages((m) => [...m, assistantMsg]);
      setConversations((cs) => cs.map((c) => (c.id === (activeId || cid) ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: new Date().toISOString() } : c)));
    }, 200);
  };

  const timeAgo = (iso) => {
    try {
      const d = new Date(iso);
      const diff = Math.max(0, Date.now() - d.getTime());
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return '';
    }
  };

  const suggestions = [
    'Explain quantum computing in simple terms',
    'Write a Python function to sort a list',
    'What are the benefits of meditation?',
    'Help me plan a weekend trip to Paris'
  ];

  return (
    <div className="flex h-screen bg-gray-50 pt-14">
      {/* Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between w-full">
            <span className={`font-semibold text-gray-800 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>Conversations</span>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded hover:bg-gray-100"
              aria-label="Toggle panel"
            >
              <FiChevronLeft className={`${isSidebarCollapsed ? 'transform rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <button onClick={newConversation} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2">
            <FiPlus />
            {!isSidebarCollapsed && <span>New Chat</span>}
          </button>
        </div>

        {!isSidebarCollapsed && (
          <div className="flex-1 overflow-auto">
            {conversations.length === 0 ? (
              <div className="p-6 flex flex-col items-center justify-center text-gray-500">
                <FiMessageSquare className="w-8 h-8 mb-2" />
                <p className="text-center">No conversations yet</p>
              </div>
            ) : (
              <ul className="p-2 space-y-1">
                {conversations.map((c) => {
                  const firstAssistant = (c.messages || []).find((m) => m.role === 'assistant');
                  const preview = firstAssistant ? firstAssistant.content : (c.messages[0]?.content || '');
                  const isActive = c.id === activeId;
                  const isToday = (() => {
                    try {
                      const d = new Date(c.updatedAt);
                      const t = new Date();
                      return d.toDateString() === t.toDateString();
                    } catch { return true; }
                  })();
                  return (
                    <li key={c.id}>
                      <button onClick={() => selectConversation(c.id)} className={`w-full text-left px-3 py-3 rounded-lg border ${isActive ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                        <div className="text-sm font-medium text-gray-900 truncate">{c.title || 'Conversation'}</div>
                        <div className="text-xs text-gray-500 truncate">{preview}</div>
                        <div className="text-[11px] text-gray-400 mt-1">{isToday ? 'Today' : new Date(c.updatedAt).toLocaleDateString()}</div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center fixed top-0 left-0 right-0 z-30">
          <h1 className="text-xl font-semibold">AI Chat</h1>
          <div className="flex items-center space-x-4">
            {/* Credits pill */}
            <div className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-100 shadow-sm">
              <FiRefreshCcw className="opacity-80" />
              <span className="font-semibold">1,248</span>
            </div>
            {/* Bell with embedded badge (restored) */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen((o) => !o)}
                className="p-2 rounded-full hover:bg-gray-100 relative"
                aria-label="Notifications"
              >
                <FiBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-blue-600 text-white text-[10px] leading-[18px] rounded-full text-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-20">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{unreadCount}</span>
                      )}
                    </div>
                    <button onClick={markAllRead} className="text-sm text-blue-600 hover:underline">Mark all read</button>
                  </div>
                  <ul className="max-h-80 overflow-auto">
                    {notifications.length === 0 && (
                      <li className="px-4 py-6 text-sm text-gray-500">No notifications</li>
                    )}
                    {notifications.map((n) => (
                      <li key={n.id} className="px-4 py-3 hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 ${n.is_read ? 'text-gray-300' : 'text-green-500'}`}>
                            <FiCheckCircle />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm ${n.is_read ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>{n.title || 'Notification'}</p>
                              <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{timeAgo(n.created_at)}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                          </div>
                          {!n.is_read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Gradient avatar + username */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen((o) => !o)}
                className="flex items-center space-x-2 p-1 rounded hover:bg-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 text-white flex items-center justify-center">
                  <FiUser />
                </div>
                <span className="hidden md:inline font-medium text-gray-900">{user?.username || 'User'}</span>
                <FiChevronDown className="hidden md:inline text-gray-700" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-2">
                  <div className="px-4 py-2 text-sm text-gray-700">{user?.username || 'User'}</div>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Settings</button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                    onClick={() => {
                      dispatch(logout());
                      navigate('/signin');
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-auto p-6">
          {messages.length === 0 ? (
            <div className="max-w-2xl w-full mx-auto text-center flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <FiMessageSquare className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Welcome to AI Chat</h2>
              <p className="text-gray-600 mb-8">
                Start a conversation with our AI assistant. Ask questions, get help with tasks, or explore ideas together.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 w-full">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors"
                    onClick={() => sendMessage(suggestion)}
                  >
                    <div className="flex items-start">
                      <FiMessageSquare className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full space-y-8">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`w-full md:w-auto ${m.role === 'assistant' ? 'bg-blue-50/60 rounded-xl p-5' : ''}`}>
                    <div className={`flex items-center gap-2 mb-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {m.role === 'assistant' ? (
                        <>
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">AI</div>
                          <span className="text-sm text-gray-800 font-medium">AI Assistant</span>
                          <span className="text-xs text-gray-400">{formatTime(m.createdAt)}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-gray-400">{formatTime(m.createdAt)}</span>
                          <span className="text-sm text-gray-800 font-medium">You</span>
                          <div className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs">
                            <FiUser />
                          </div>
                        </>
                      )}
                    </div>
                    <div className={`rounded-2xl ${m.role === 'user' ? 'bg-white border border-gray-200 shadow-sm' : 'bg-white border border-blue-200 shadow-sm'} px-4 py-3 max-w-[80%]`}>
                      <p className="whitespace-pre-wrap text-gray-800 text-[15px] leading-6">{m.content}</p>
                    </div>
                    {m.role === 'assistant' && (
                      <div className="flex items-center gap-4 text-blue-500 mt-3 text-sm">
                        <button className="hover:text-blue-700" aria-label="Like"><FiThumbsUp /></button>
                        <button className="hover:text-blue-700" aria-label="Dislike"><FiThumbsDown /></button>
                        <button className="hover:text-blue-700" aria-label="Copy"><FiCopy /></button>
                        <button className="hover:text-blue-700" aria-label="More"><FiMoreHorizontal /></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="max-w-3xl mx-auto relative">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask me anything..."
                rows={1}
                className="w-full border border-gray-300 rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                style={{ minHeight: '48px', maxHeight: '160px' }}
              />
              <button
                onClick={() => sendMessage(input)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600"
              >
                <FiSend className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>{input.length}/2000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

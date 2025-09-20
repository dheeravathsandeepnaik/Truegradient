import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import store from './store/store.js';

import App from './App.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import Chat from './pages/Chat.jsx';
import './index.css';

function Protected({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/signin" replace />;
  return children;
}

function RootRedirect() {
  const token = localStorage.getItem('token');
  return <Navigate to={token ? '/chat' : '/signin'} replace />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Redirect root `/` based on auth state */}
          <Route path="/" element={<RootRedirect />} />

          {/* Auth pages */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected chat page */}
          <Route
            path="/chat"
            element={
              <Protected>
                <App>
                  <Chat />
                </App>
              </Protected>
            }
          />
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);


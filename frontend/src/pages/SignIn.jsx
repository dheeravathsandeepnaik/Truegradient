import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { signIn, fetchMe } from '../features/auth/authSlice.js';
import { useNavigate, Link } from 'react-router-dom';

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await dispatch(signIn({ username, password })).unwrap();
      await dispatch(fetchMe());
      nav('/chat');
    } catch (err) {
      const message = err?.response?.data?.error || 'Login failed';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-96 bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center">Sign In</h2>
        <form onSubmit={submit} className="space-y-4 mt-6">
          <input
            type="text"
            placeholder="Username"
            className="w-full border rounded p-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md p-2">{error}</div>
          )}
          <button className="w-full bg-blue-500 text-white py-2 rounded">Sign In</button>
        </form>
        <p className="text-sm mt-4 text-center">
          Don’t have an account? <Link to="/signup" className="text-blue-500">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}


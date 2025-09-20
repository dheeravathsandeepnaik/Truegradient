import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { signUp, fetchMe } from '../features/auth/authSlice.js';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const nav = useNavigate();

  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password)
  };
  const allValid = checks.length && checks.upper && checks.lower && checks.number;
  const match = password === confirmPassword && confirmPassword.length > 0;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    if (!allValid) {
      setError('Please meet all password requirements');
      return;
    }
    if (!match) {
      setError('Passwords do not match');
      return;
    }
    try {
      await dispatch(signUp({ username, password })).unwrap();
      await dispatch(fetchMe());
      nav('/chat');
    } catch (err) {
      const message = err?.response?.data?.error || 'Sign up failed';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center">Sign Up</h2>
        <p className="text-sm text-slate-500 text-center mt-1">Create an account to get started</p>

        <form onSubmit={submit} className="space-y-4 mt-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              placeholder="Choose a username"
              className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                className="w-full border rounded-lg p-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            {/* Checklist */}
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex items-center gap-2">
                {checks.length ? (
                  <FiCheckCircle className="text-green-500" />
                ) : (
                  <FiXCircle className="text-slate-300" />
                )}
                <span className={checks.length ? 'text-green-600' : 'text-slate-500'}>At least 8 characters</span>
              </li>
              <li className="flex items-center gap-2">
                {checks.upper ? (
                  <FiCheckCircle className="text-green-500" />
                ) : (
                  <FiXCircle className="text-slate-300" />
                )}
                <span className={checks.upper ? 'text-green-600' : 'text-slate-500'}>One uppercase letter</span>
              </li>
              <li className="flex items-center gap-2">
                {checks.lower ? (
                  <FiCheckCircle className="text-green-500" />
                ) : (
                  <FiXCircle className="text-slate-300" />
                )}
                <span className={checks.lower ? 'text-green-600' : 'text-slate-500'}>One lowercase letter</span>
              </li>
              <li className="flex items-center gap-2">
                {checks.number ? (
                  <FiCheckCircle className="text-green-500" />
                ) : (
                  <FiXCircle className="text-slate-300" />
                )}
                <span className={checks.number ? 'text-green-600' : 'text-slate-500'}>One number</span>
              </li>
            </ul>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                className={`w-full border rounded-lg p-2.5 pr-10 focus:outline-none focus:ring-2 ${
                  match || confirmPassword.length === 0 ? 'focus:ring-blue-500' : 'focus:ring-rose-500 border-rose-300'
                }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {confirmPassword.length > 0 && !match && (
              <p className="text-xs text-rose-600 mt-1">Passwords do not match</p>
            )}
          </div>

          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md p-2">{error}</div>
          )}

          <button
            disabled={!allValid || !match || !username.trim()}
            className={`w-full py-2 rounded-lg transition-colors ${
              !allValid || !match || !username.trim()
                ? 'bg-blue-400/50 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Sign Up
          </button>
        </form>
        <p className="text-sm mt-4 text-center">
          Already have an account? <Link to="/signin" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}


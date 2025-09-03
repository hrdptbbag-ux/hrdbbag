import React, { useState } from 'react';
import { View } from '../types';
import { ADMIN_CREDENTIALS } from '../config';

interface LoginPageProps {
  onLogin: (success: boolean) => void;
  onNavigate: (view: View) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_CREDENTIALS.USERNAME && password === ADMIN_CREDENTIALS.PASSWORD) {
      setError('');
      onLogin(true);
    } else {
      setError('Username atau password salah.');
      onLogin(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-800/60 rounded-xl shadow-lg border border-slate-700">
        <h1 className="text-2xl font-bold text-center text-white">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-medium text-slate-300"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-slate-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
              required
              autoComplete="current-password"
            />
          </div>
           {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
          >
            Login
          </button>
        </form>
         <button
          onClick={() => onNavigate('OPERATIONAL_DASHBOARD')}
          className="w-full text-center text-sm text-cyan-400 hover:underline mt-4"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
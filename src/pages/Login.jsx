// DukanBook - Login Page
import React, { useState } from 'react';
import { Package, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (username === 'shop123' && password === 'qwerty123') {
      window.storage.sessionSet('db_auth', { loggedIn: true, user: username });
      onLogin();
    } else {
      setError('Invalid username or password');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] via-white to-[#E8F7FD] px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#27CCF5]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-10 w-60 h-60 bg-[#5DC0BA]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-[#27CCF5]/10 rounded-full blur-3xl"></div>
      </div>

      <div className={`relative w-full max-w-md ${isShaking ? 'animate-shake' : ''}`}>
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center h-14 w-14 rounded-3xl bg-[#27CCF5]/10 text-[#27CCF5] shadow-sm shadow-[#27CCF5]/10">
                <Package className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#0F172A]">DukanBook</h1>
                <p className="text-sm text-[#64748B]">Your modern inventory management dashboard</p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-[#0F172A] mb-6">Welcome back</h2>

            {error && (
              <div className="mb-5 flex items-center gap-2 rounded-[16px] border border-[#FECACA] bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C]">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="input-modern"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">PIN</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your PIN"
                    required
                    className="input-modern pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full">
                <LogIn className="h-5 w-5" />
                Login
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-[#64748B] mt-6">© 2026 DukanBook. All rights reserved.</p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

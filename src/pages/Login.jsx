// DukanBook - Login & Registration Page
import React, { useState } from 'react';
import { Package, LogIn, UserPlus, Eye, EyeOff, AlertCircle, Sparkles, Loader2, Info } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

export default function Login({ onLogin }) {
  // Completely independent states for Login and Signup
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    // Navigating between pages clears the previous form
    setLoginEmail('');
    setLoginPassword('');
    setSignupEmail('');
    setSignupPassword('');
    setError('');
    setSuccessMessage('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (!isSupabaseConfigured) {
      // Sandbox / Local fallback mode
      // Accept either email='shop123' / password='qwerty123' or email='shop@dukanbook.com' / password='qwerty123'
      if ((loginEmail === 'shop123' || loginEmail === 'shop@dukanbook.com') && loginPassword === 'qwerty123') {
        window.storage.sessionSet('db_auth', { loggedIn: true, user: loginEmail });
        
        // Reset the form after successful login
        setLoginEmail('');
        setLoginPassword('');
        
        onLogin();
      } else {
        setError('Invalid username or PIN. (For Sandbox Mode, use shop123 / qwerty123)');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
      setLoading(false);
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (signInError) throw signInError;

      // Reset the form after successful login
      setLoginEmail('');
      setLoginPassword('');
      
      onLogin();
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (!isSupabaseConfigured) {
      setError('Registration is not supported in Sandbox Mode.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
      });

      if (signUpError) throw signUpError;

      // Reset the form after successful signup
      setSignupEmail('');
      setSignupPassword('');

      if (data.session) {
        // Logged in automatically
        onLogin();
      } else {
        // Email confirmation is enabled
        setSuccessMessage('Registration successful! Please check your email to confirm your account, then log in.');
        setIsSignUp(false); // Switch back to login
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] via-white to-[#E8F7FD] px-4 py-8 relative">
      {/* Decorative Blur Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#27CCF5]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-10 w-60 h-60 bg-[#5DC0BA]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-[#27CCF5]/10 rounded-full blur-3xl"></div>
      </div>

      <div className={`relative w-full max-w-md ${isShaking ? 'animate-shake' : ''}`}>
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 sm:p-10">
            {/* Logo Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center h-14 w-14 rounded-3xl bg-[#27CCF5]/10 text-[#27CCF5] shadow-sm shadow-[#27CCF5]/10">
                <Package className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">DukanBook</h1>
                <p className="text-sm text-[#64748B]">Your modern inventory management dashboard</p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-[#0F172A] mb-6">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>

            {/* Error Message */}
            {error && (
              <div className="mb-5 flex items-start gap-2 rounded-[16px] border border-[#FECACA] bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C] fade-in">
                <AlertCircle className="h-5 w-5 text-[#B91C1C] shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-5 flex items-start gap-2 rounded-[16px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 fade-in">
                <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Conditionally Render Form with unique key to prevent input element reuse */}
            {isSignUp ? (
              <form key="signup-form" onSubmit={handleSignUpSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    key="signup-email-input"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    disabled={loading}
                    className="input-modern"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      key="signup-password-input"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                      className="input-modern pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="btn-primary w-full flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      <span>Sign Up</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form key="login-form" onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">
                    {isSupabaseConfigured ? 'Email Address' : 'Username or Email'}
                  </label>
                  <input
                    type={isSupabaseConfigured ? 'email' : 'text'}
                    key="login-email-input"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={isSupabaseConfigured ? 'name@example.com' : 'Enter username or email'}
                    required
                    disabled={loading}
                    className="input-modern"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">
                    {isSupabaseConfigured ? 'Password' : 'PIN or Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      key="login-password-input"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder={isSupabaseConfigured ? 'Enter your password' : 'Enter your PIN or password'}
                      required
                      disabled={loading}
                      className="input-modern pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="btn-primary w-full flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      <span>Login</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Toggle Mode */}
            {isSupabaseConfigured && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleToggleMode}
                  className="text-sm font-semibold text-[#27CCF5] hover:text-[#18B8E2] transition-colors cursor-pointer"
                >
                  {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                </button>
              </div>
            )}
            
            {/* Sandbox Mode Instructions badge */}
            {!isSupabaseConfigured && (
              <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex gap-2.5 items-start">
                <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Sandbox Mode Active</span>
                  To access the demo interface, use the username <strong>shop123</strong> and PIN <strong>qwerty123</strong>. Configure your <code>.env</code> file to enable Supabase Authentication.
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-[#64748B] mt-6">© 2026 DukanBook. All rights reserved.</p>
      </div>

      {/* Shake Keyframes style block */}
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

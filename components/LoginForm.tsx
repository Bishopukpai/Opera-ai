// components/LoginForm.tsx
"use client";

import { useState, FormEvent } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Terminal, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      if (
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/invalid-credential'
      ) {
        setError('Invalid core validation credentials.');
      } else {
        setError(err.message || 'An unexpected operational handshake failure occurred.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative max-w-md w-full mx-auto">
      {/* Decorative cyber ambient backgrounds */}
      <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Panel Container */}
      <div className="relative p-8 bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 ring-1 ring-slate-700/20">
        
        {/* Header Icon & Title */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl mb-4 text-blue-500 shadow-inner">
            <Terminal className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
            Access AgentStack
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Authenticate session to resume node orchestrations.
          </p>
        </div>

        {/* Error Feedback Node */}
        {error && (
          <div className="text-red-400 text-xs mb-5 bg-red-950/30 px-4 py-3 rounded-xl border border-red-900/50 flex items-start gap-2 backdrop-blur-sm animate-fade-in">
            <span className="font-mono text-red-500 font-bold">[ERROR]</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Work Identifier
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                placeholder="operator@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input Field with Visibility Toggle */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Security Keyphrase
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full pl-10 pr-12 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Infrastructure Action Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:scale-[0.99] text-white font-medium rounded-xl transition-all duration-150 disabled:opacity-60 disabled:pointer-events-none text-sm shadow-lg shadow-blue-950/50 flex items-center justify-center gap-2 border border-blue-500/20"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synchronizing Environment...</span>
              </>
            ) : (
              <span>Establish Gateway Uplink</span>
            )}
          </button>
        </form>

        {/* Footer Tenant Routing Navigation */}
        <div className="mt-8 pt-5 border-t border-slate-800/60 text-center text-xs text-slate-500">
          Initialize new corporate cluster?{' '}
          <span 
            className="text-blue-400 hover:text-blue-300 transition-colors font-medium cursor-pointer underline underline-offset-4 decoration-blue-500/30 hover:decoration-blue-400" 
            onClick={() => router.push('/signup')}
          >
            Deploy New Instance
          </span>
        </div>
      </div>
    </div>
  );
}
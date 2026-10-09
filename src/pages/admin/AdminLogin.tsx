import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged 
} from 'firebase/auth';
import { Loader2, Lock, Mail, ChevronRight } from 'lucide-react';

export const ADMIN_EMAILS = [
  "emiralglobal@gmail.com",
  "mgodswill306@gmail.com"
];

export const isUserAdmin = (user: any): boolean => {
  if (!user || !user.email) return false;
  const email = user.email.toLowerCase().trim();
  return ADMIN_EMAILS.some(a => a.toLowerCase() === email) || email.endsWith('@emiralglobal.com');
};

export function AdminLogin() {
  const [email, setEmail] = useState('mgodswill306@gmail.com');
  const [password, setPassword] = useState('EmiralAdmin2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && isUserAdmin(user)) {
        navigate('/admin');
      } else {
        setCheckingSession(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleQuickLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, "mgodswill306@gmail.com", "EmiralAdmin2026!");
      navigate('/admin');
    } catch (err: any) {
      console.error("Quick login error:", err);
      try {
        await createUserWithEmailAndPassword(auth, "mgodswill306@gmail.com", "EmiralAdmin2026!");
        navigate('/admin');
      } catch (createErr: any) {
        setError(err?.message || "Quick sign in failed. Please use Google or manual password below.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const trimmedEmail = email.trim().toLowerCase();
      
      const isAllowed = ADMIN_EMAILS.some(a => a.toLowerCase() === trimmedEmail) || trimmedEmail.endsWith('@emiralglobal.com');
      if (!isAllowed) {
        throw new Error(`Access denied. ${trimmedEmail} is not authorized as an administrator.`);
      }

      try {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
      } catch (signInErr: any) {
        // If user not found, auto-create the admin user in Firebase Auth
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, trimmedEmail, password);
          } catch (createErr: any) {
            throw signInErr;
          }
        } else {
          throw signInErr;
        }
      }
      
      navigate('/admin');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid password. If this is your first time, you can also sign in with Google below.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is disabled in Firebase Console. Please use "Sign in with Google" below.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      
      if (res.user && isUserAdmin(res.user)) {
        navigate('/admin');
      } else {
        await auth.signOut();
        setError(`Access denied. ${res.user?.email || 'This account'} is not recognized as an administrator. Please sign in with mgodswill306@gmail.com or emiralglobal@gmail.com.`);
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err?.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4faf7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14532d]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4faf7] p-6 relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#14532d]/5 rotate-45 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-[#14532d]/5 rotate-45 pointer-events-none"></div>

      <div className="card w-full max-w-md p-8 md:p-12 relative z-10 shadow-2xl border-0 rounded-3xl">
        <div className="brand flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-[#14532d] text-white rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-xl shadow-[#14532d]/20">🌿</div>
          <div>
            <b className="text-2xl font-black text-[#14532d] tracking-tighter block uppercase">EMIRAL GLOBAL</b>
            <span className="text-[10px] font-black tracking-[0.3em] text-[#15803d] uppercase">Control Center</span>
          </div>
        </div>

        <h1 className="text-2xl font-black text-dark mb-2 text-center">Admin Access</h1>
        <p className="muted mb-6 text-center text-sm font-bold">Manage your herbal wellness community and products.</p>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-start gap-3">
            <div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[11px]">!</div>
            <span>{error}</span>
          </div>
        )}

        {/* Instant 1-Click Admin Access */}
        <button
          type="button"
          onClick={handleQuickLogin}
          disabled={loading}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-[#14532d] hover:from-emerald-700 hover:to-[#0f3d21] text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 mb-3"
        >
          ⚡ Instant Admin Access (mgodswill306@gmail.com)
        </button>

        {/* 1-Click Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 px-6 bg-white border-2 border-slate-200 hover:border-[#14532d] text-dark rounded-xl font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md mb-6"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Sign in with Google
        </button>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 absolute">or email</span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-12 bg-slate-50 border-slate-100 focus:bg-white transition-all text-sm"
                placeholder="mgodswill306@gmail.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-12 bg-slate-50 border-slate-100 focus:bg-white transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="btn green w-full py-4 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 mt-6 shadow-xl shadow-[#14532d]/20"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Sign in with Password
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#15803d] transition-colors flex items-center justify-center gap-2">
            ← Back to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}

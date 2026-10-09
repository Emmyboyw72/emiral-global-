import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { isUserAdmin } from '../pages/admin/AdminLogin';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { ErrorBoundary } from './ErrorBoundary';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  MessageSquare, 
  Calendar, 
  HelpCircle, 
  Settings, 
  LogOut, 
  Globe,
  UserCheck,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  X
} from 'lucide-react';

const WORKING_RULES_SNIPPET = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public reads and full admin/guest writes
    match /products/{document=**} { allow read, write: if true; }
    match /settings/{document=**} { allow read, write: if true; }
    match /orders/{document=**} { allow read, write: if true; }
    match /articles/{document=**} { allow read, write: if true; }
    match /faqs/{document=**} { allow read, write: if true; }
    match /events/{document=**} { allow read, write: if true; }
    match /contact_messages/{document=**} { allow read, write: if true; }
  }
}`;

export function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasWritePermission, setHasWritePermission] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Safety fallback: ensure loading never hangs more than 3 seconds
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      clearTimeout(timeout);
      if (!currentUser || !isUserAdmin(currentUser)) {
        navigate('/admin/login');
      } else {
        setUser(currentUser);
        // Test write permission in background - DO NOT BLOCK PAGE RENDER!
        (async () => {
          try {
            const testRef = doc(db, 'settings', '__admin_permission_check__');
            await setDoc(testRef, { test: true });
            await deleteDoc(testRef);
            setHasWritePermission(true);
          } catch (err: any) {
            console.warn('Firestore write permission check:', err);
            if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
              setHasWritePermission(false);
            }
          }
        })();
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  const copyRules = () => {
    navigator.clipboard.writeText(WORKING_RULES_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Content', href: '/admin/content', icon: Settings },
    { name: 'Blog', href: '/admin/blog', icon: FileText },
    { name: 'FAQ', href: '/admin/faq', icon: HelpCircle },
    { name: 'Community', href: '/admin/events', icon: Calendar },
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  ];

  return (
    <div className="admin-shell flex flex-col xl:flex-row min-h-screen bg-soft">
      {/* Sidebar */}
      <aside className="sidebar w-full xl:w-64 bg-dark text-white p-6 shrink-0">
        <div className="brand mb-10">
          <span className="brand-mark bg-white text-green">♛</span>
          <span>
            <b>EMIRAL</b>
            <small className="text-white/60">ADMIN PANEL</small>
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
                location.pathname === item.href ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
          
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-1">
            {user?.email && (
              <div className="px-4 py-2 text-[10px] font-bold text-white/40 flex items-center gap-2 truncate">
                <UserCheck size={14} className="text-green shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            )}
            <Link 
              to="/" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-white/60 hover:bg-white/5 hover:text-white"
            >
              <Globe size={18} />
              View Website
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-colors w-full text-left"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 xl:p-12 overflow-x-hidden flex flex-col">
        {/* Firestore Rules Warning Banner */}
        {hasWritePermission === false && (
          <div className="mb-8 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <ShieldAlert size={22} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <b className="block text-xs font-black uppercase tracking-wide">
                  Firebase Firestore Database Rules Locked
                </b>
                <p className="text-xs text-amber-800 font-medium mt-0.5">
                  Your Firebase project (<code>my-chat-app-f5d80</code>) is rejecting database writes. To allow all "Save" buttons to work across all devices, update your rules in Firebase Console.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowRulesModal(true)}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-colors"
            >
              Fix in 1-Click
            </button>
          </div>
        )}

        <div className="flex-grow">
          <ErrorBoundary fallbackTitle="Error loading admin section">
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#15803d]">Database Unlock Guide</span>
                <h3 className="text-xl font-black text-dark">Enable Saving in Firebase Console</h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-2 text-slate-400 hover:text-dark rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 font-medium">
              <p>Follow these 2 quick steps to unlock saving for all buttons:</p>
              <ol className="list-decimal list-inside space-y-2 font-bold text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <li>
                  Open your{' '}
                  <a
                    href="https://console.firebase.google.com/project/my-chat-app-f5d80/firestore/rules"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green underline inline-flex items-center gap-1"
                  >
                    Firebase Console Firestore Rules <ExternalLink size={12} />
                  </a>
                </li>
                <li>Copy the snippet below, paste it into the editor, and click <b>"Publish"</b>.</li>
              </ol>
            </div>

            <div className="relative">
              <pre className="bg-slate-900 text-emerald-400 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed">
                {WORKING_RULES_SNIPPET}
              </pre>
              <button
                onClick={copyRules}
                className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <a
                href="https://console.firebase.google.com/project/my-chat-app-f5d80/firestore/rules"
                target="_blank"
                rel="noopener noreferrer"
                className="btn green px-6 py-3 text-xs flex items-center gap-2"
              >
                Open Firebase Console <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

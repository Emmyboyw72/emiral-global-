import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, AlertCircle, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../lib/useSettings';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { cart } = useCart();
  const { settings } = useSettings();
  const location = useLocation();
  const [pendingOrder, setPendingOrder] = useState<string | null>(null);

  useEffect(() => {
    const checkPending = async () => {
      const pending = localStorage.getItem('emiral_pending_order');
      if (!pending) {
        setPendingOrder(null);
        return;
      }

      try {
        const q = query(collection(db, 'orders'), where('order_number', '==', pending));
        const snap = await getDocs(q);
        
        if (snap.empty) {
          localStorage.removeItem('emiral_pending_order');
          setPendingOrder(null);
        } else {
          const data = snap.docs[0].data();
          if (data.payment_status === 'PAYMENT_CONFIRMED' || data.order_status === 'Cancelled') {
            localStorage.removeItem('emiral_pending_order');
            setPendingOrder(null);
          } else {
            setPendingOrder(pending);
          }
        }
      } catch (err) {
        console.error("Error verifying pending order:", err);
        setPendingOrder(pending);
      }
    };
    checkPending();
    window.addEventListener('storage', checkPending);
    return () => window.removeEventListener('storage', checkPending);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Wellness', href: '/wellness' },
    { name: 'Business', href: '/opportunity' },
    { name: 'Community', href: '/community' },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const promoText = settings.promoBanner || "Discover Premium Herbal Wellness Products Created for Holistic Healing • ";

  return (
    <>
      {pendingOrder && location.pathname !== '/payment' && (
        <div className="bg-rose-600 text-white py-3 px-4 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top duration-500 z-[110] relative">
          <AlertCircle size={16} className="animate-pulse shrink-0" />
          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-center">
            You have a pending payment (Order: {pendingOrder})
          </span>
          <Link 
            to={`/payment?order=${pendingOrder}`}
            className="bg-white text-rose-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter hover:bg-slate-100 transition-colors flex items-center gap-1 shrink-0"
          >
            Complete Now <ArrowRight size={10} />
          </Link>
        </div>
      )}
      <div className="bg-[#14532d] text-white py-2 px-4 overflow-hidden whitespace-nowrap">
        <div className="flex animate-marquee gap-8 font-extrabold uppercase tracking-widest text-[9px]">
          <span>{promoText}</span>
          <span>{promoText}</span>
          <span>{promoText}</span>
          <span>{promoText}</span>
        </div>
      </div>
      <header className="site-header">
        <div className="container nav">
          {/* Zone 1: Brand */}
          <Link to="/" className="brand">
            <span className="brand-mark text-white">🌿</span>
            <span>
              <b className="text-[#14532d] font-black uppercase tracking-tight text-xl leading-none">EMIRAL</b>
              <small className="text-[#15803d] font-black tracking-[0.2em] -mt-1 uppercase">GLOBAL</small>
            </span>
          </Link>

          {/* Zone 2: Nav Links */}
          <nav className="menu hidden xl:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={clsx(
                  "transition-colors",
                  location.pathname === link.href ? "text-[#15803d]" : "text-[#14532d]/70"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Zone 3: Actions */}
          <div className="actions">
            <Link to="/cart" className="cart-pill hidden md:flex items-center gap-2 rounded-full border-2 border-[#edf0ed] hover:border-green transition-colors px-4 py-2">
              <ShoppingBag size={18} className="text-[#15803d]" />
              <span className="font-black">({cartCount})</span>
            </Link>
            <button 
              className="mobile-toggle text-[#14532d]"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="xl:hidden bg-white border-t border-line p-8 fixed inset-x-0 top-[110px] bottom-0 z-50 animate-in slide-in-from-top duration-300">
            <div className="grid grid-cols-1 gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="py-2 text-2xl font-black uppercase tracking-tight text-[#14532d] hover:text-[#15803d]"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-line my-4"></div>
              <Link
                to="/track-order"
                className="py-2 text-xl font-black uppercase tracking-tight text-[#14532d]/60"
                onClick={() => setIsOpen(false)}
              >
                Track Order
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Side Cart Tab - Fixed on right */}
      <Link 
        to="/cart" 
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-[#14532d] text-white py-8 px-3 flex flex-col items-center gap-2 z-[100] rounded-l-2xl shadow-2xl hover:translate-x-[-4px] transition-transform"
      >
        <ShoppingBag size={24} />
        <span className="[writing-mode:vertical-lr] font-black uppercase tracking-widest text-[9px] mt-2">CART ({cartCount})</span>
      </Link>
    </>
  );
}

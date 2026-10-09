import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Search, MapPin, CreditCard, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderNumber) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const q = query(collection(db, 'orders'), where('order_number', '==', orderNumber.trim().toUpperCase()));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setError('No order was found with that order number.');
      } else {
        const doc = snapshot.docs[0];
        setOrder({ id: doc.id, ...doc.data() });
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while searching for your order.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if order in URL
  useState(() => {
    if (orderNumber) handleSearch();
  });

  const money = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(val);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAYMENT_CONFIRMED':
      case 'Delivered':
        return 'green';
      case 'PAYMENT_PROOF_SUBMITTED':
      case 'Processing':
      case 'Shipped':
        return 'orange';
      default:
        return 'orange';
    }
  };

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow text-white/60">Order Tracking</div>
          <h1>Track Your Order</h1>
          <p>Enter the order number shown after checkout to see your status.</p>
        </div>
      </section>

      <section className="section">
        <div className="container max-w-2xl">
          <form onSubmit={handleSearch} className="card flex gap-4 mb-12">
            <input 
              className="input flex-grow" 
              placeholder="Example: EMABC123" 
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
            />
            <button type="submit" disabled={loading} className="btn green px-8 flex items-center gap-2">
              {loading ? 'Searching...' : <><Search size={18} /> Track</>}
            </button>
          </form>

          {error && (
            <div className="notice error flex items-center gap-3">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          {order && (
            <div>
              <div className="card space-y-8">
                <div className="split border-b border-slate-100 pb-6">
                  <div>
                    <div className="eyebrow">Order {order.order_number}</div>
                    <h2 className="text-2xl font-black text-dark">{order.customer_name}</h2>
                  </div>
                  <span className={twMerge("status", getStatusColor(order.order_status))}>
                    {order.order_status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-light rounded-xl flex items-center justify-center text-slate-400">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Payment</div>
                      <div className="font-bold text-sm text-dark">{order.payment_status.replace(/_/g, ' ')}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-light rounded-xl flex items-center justify-center text-slate-400">
                      <Clock size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Created</div>
                      <div className="font-bold text-sm text-dark">{new Date(order.created_at?.toDate()).toLocaleDateString('en-GB')}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-light rounded-xl flex items-center justify-center text-slate-400">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total</div>
                      <div className="font-bold text-sm text-dark">{money(order.total)}</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-light rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Delivery Details</h4>
                  <p className="text-sm font-bold text-dark leading-relaxed">
                    {order.delivery_address}, {order.city}, {order.country}
                  </p>
                </div>

                {order.payment_status !== 'PAYMENT_CONFIRMED' && (
                  <div className="pt-4">
                    <Link to={`/payment?order=${order.order_number}`} className="btn outline w-full">
                      Update Payment Proof
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

import { twMerge } from 'tailwind-merge';

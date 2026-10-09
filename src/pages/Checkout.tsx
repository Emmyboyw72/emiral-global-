import { useForm } from 'react-hook-form';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, writeBatch, doc, query, where, getDocs } from 'firebase/firestore';
import { ArrowLeft, Lock, CheckCircle2, Copy, Check, ArrowRight, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSettings } from '../lib/useSettings';

export function Checkout() {
  const { cart, subtotal, clearCart } = useCart();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [deliveryFee, setDeliveryFee] = useState(3000);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (settings.deliveryFee) {
      setDeliveryFee(parseFloat(settings.deliveryFee) || 3000);
    }
  }, [settings]);

  useEffect(() => {
    const checkPending = async () => {
      const pending = localStorage.getItem('emiral_pending_order');
      if (pending && !orderSuccess) {
        try {
          const q = query(collection(db, 'orders'), where('order_number', '==', pending));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const data = snap.docs[0].data();
            if (data.payment_status === 'WAITING_FOR_PAYMENT' || data.payment_status === 'PAYMENT_REJECTED') {
              setOrderSuccess(data);
            } else {
              // If already paid, clear the storage
              localStorage.removeItem('emiral_pending_order');
              setOrderSuccess(null);
            }
          } else {
            // Admin deleted the order
            localStorage.removeItem('emiral_pending_order');
            setOrderSuccess(null);
          }
        } catch (err) {
          console.error("Error checking pending order:", err);
        }
      }
      setLoading(false);
    };
    checkPending();
  }, [orderSuccess]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-soft">
      <div className="w-12 h-12 border-4 border-green border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (cart.length === 0 && !orderSuccess) {
    return <Navigate to="/products" />;
  }

  const generateOrderNumber = () => {
    return 'EM' + Math.random().toString(36).substring(2, 8).toUpperCase() + Date.now().toString().slice(-4);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const onSubmit = async (data: any) => {
    try {
      const orderNumber = generateOrderNumber();
      const orderData = {
        order_number: orderNumber,
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        country: data.country,
        city: data.city,
        delivery_address: data.address,
        notes: data.notes || '',
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total: subtotal + deliveryFee,
        currency: '₦',
        payment_status: 'WAITING_FOR_PAYMENT',
        order_status: 'Pending',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      const batch = writeBatch(db);
      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      
      cart.forEach((item) => {
        const itemRef = doc(collection(db, `orders/${orderRef.id}/items`));
        batch.set(itemRef, {
          order_id: orderRef.id,
          product_id: item.id,
          product_name: item.name,
          price: item.price,
          quantity: item.qty,
          image: item.image
        });
      });

      await batch.commit();
      
      // Save for persistence
      localStorage.setItem('emiral_pending_order', orderNumber);
      
      clearCart();
      setOrderSuccess(orderData);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      alert('Failed to place order. Please try again.');
    }
  };

  const money = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(val);
  };

  if (orderSuccess) {
    return (
      <div className="section bg-soft min-h-screen">
        <div className="container max-w-2xl">
          <div className="card text-center py-12 md:px-12 rounded-3xl shadow-2xl border-0 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-green"></div>
            
            <div className="w-20 h-20 bg-emerald-50 text-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <CheckCircle2 size={40} />
            </div>
            
            <div className="eyebrow">Order Placed Successfully</div>
            <h1 className="text-4xl font-black text-dark mb-4 leading-tight tracking-tighter">Transfer Payment Now</h1>
            <p className="text-sm font-bold text-slate-500 mb-8">Your order has been received. Please make a bank transfer to the account below to confirm your purchase.</p>

            <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl space-y-6 text-left mb-8 shadow-sm">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-black text-dark">{orderSuccess.order_number}</span>
                  <button onClick={() => copyToClipboard(orderSuccess.order_number, 'order')} className="text-slate-300 hover:text-green">
                    {copied === 'order' ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount Due</span>
                <span className="text-xl font-black text-green">{money(orderSuccess.total)}</span>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Bank Name</div>
                  <div className="font-black text-dark text-lg uppercase">{settings.bankName || 'Fidelity Bank'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Account Name</div>
                  <div className="font-black text-dark text-lg uppercase tracking-tight">{settings.bankAccountName || 'PEACE OKONGWO'}</div>
                </div>
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Account Number</div>
                    <div className="text-2xl font-black text-dark tracking-widest font-mono">{settings.bankAccountNumber || '6052773663'}</div>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(settings.bankAccountNumber || '6052773663', 'acc')}
                    className="btn green p-3 rounded-lg"
                  >
                    {copied === 'acc' ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link 
                to={`/payment?order=${orderSuccess.order_number}`}
                className="btn green w-full py-4 text-base font-black uppercase tracking-widest rounded-xl shadow-xl shadow-green/20 flex items-center justify-center gap-2"
              >
                I have made payment <ArrowRight size={20} />
              </Link>
              <p className="text-[10px] font-bold text-slate-400 italic">
                You can upload your payment receipt in the next step.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow text-white/60">Secure Order</div>
          <h1>Checkout</h1>
          <p>Enter your delivery details. After placing the order, you will receive instructions for bank transfer.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="card">
                <h3 className="text-xl font-black text-dark mb-8 flex items-center gap-2">
                  <span className="w-8 h-8 bg-dark text-white rounded-full flex items-center justify-center text-sm">1</span>
                  Delivery Information
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Full Name *</label>
                    <input {...register('name', { required: true })} className="input" placeholder="Recipient Name" />
                    {errors.name && <p className="text-rose-500 text-[10px] mt-1 font-bold uppercase">Required</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Email *</label>
                      <input {...register('email', { required: true, pattern: /^\S+@\S+$/i })} className="input" placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Phone *</label>
                      <input {...register('phone', { required: true })} className="input" placeholder="080..." />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Country *</label>
                      <select {...register('country', { required: true })} className="input">
                        <option value="Nigeria">Nigeria</option>
                        <option value="South Africa">South Africa</option>
                        <option value="Kenya">Kenya</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">City *</label>
                      <input {...register('city', { required: true })} className="input" placeholder="Lagos" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Delivery Address *</label>
                    <textarea {...register('address', { required: true })} className="input h-24 resize-none" placeholder="House No, Street, Landmark..." />
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Order Notes</label>
                    <textarea {...register('notes')} className="input h-24 resize-none" placeholder="Any special instructions?" />
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="card">
                <h3 className="text-xl font-black text-dark border-b border-slate-100 pb-4 mb-6">Order Summary</h3>
                <div className="space-y-4 mb-8">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between gap-4 text-sm">
                      <span className="text-slate-500">{item.name} <span className="font-bold">× {item.qty}</span></span>
                      <span className="font-black text-dark">{money(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 text-sm font-bold border-t border-slate-100 pt-6 mb-8">
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase tracking-widest text-[10px]">Subtotal</span>
                    <span className="text-dark">{money(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase tracking-widest text-[10px]">Delivery</span>
                    <span className="text-dark">{money(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total</span>
                    <span className="text-2xl font-black text-green">{money(subtotal + deliveryFee)}</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn green w-full py-4 text-base flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Processing...' : <><Lock size={18} /> Place Order</>}
                </button>
              </div>
              
              <p className="text-[10px] text-center font-black uppercase tracking-widest text-slate-400">
                Safe & Secure Checkout
              </p>
            </aside>
          </form>
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { db, storage } from '../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle2, AlertCircle, ArrowRight, Loader2, Copy, Check, XCircle, Phone, MessageSquare, Save, Clock } from 'lucide-react';
import { ImageUpload } from '../components/ImageUpload';
import { useSettings } from '../lib/useSettings';
import { twMerge } from 'tailwind-merge';

export function Payment() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderNum, setOrderNum] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const { settings } = useSettings();
  const [showUpload, setShowUpload] = useState(false);
  const [tempReceiptUrl, setTempReceiptUrl] = useState('');

  const submitReceipt = async () => {
    if (!order || !tempReceiptUrl) return;
    setUploading(true);
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        payment_receipt_url: tempReceiptUrl,
        payment_status: 'PAYMENT_PROOF_SUBMITTED',
        rejection_reason: null,
        updated_at: serverTimestamp()
      });
      setSuccess('Payment proof submitted successfully! Our admin team will verify it shortly.');
      setTempReceiptUrl('');
      setShowUpload(false);
      fetchOrder(orderNum);
    } catch (err) {
      setError('Failed to submit receipt. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit the payment process? You can return later using your Order Number.')) {
      localStorage.removeItem('emiral_pending_order');
      navigate('/');
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (order && order.payment_status === 'WAITING_FOR_PAYMENT') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [order]);

  const fetchOrder = async (num: string) => {
    if (!num) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), where('order_number', '==', num.trim().toUpperCase()));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const d = snapshot.docs[0];
        setOrder({ id: d.id, ...d.data() });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let currentOrderNum = orderNum;
    if (!currentOrderNum) {
      const stored = localStorage.getItem('emiral_pending_order');
      if (stored) {
        currentOrderNum = stored;
        setOrderNum(stored);
        setSearchParams({ order: stored });
      }
    }
    
    if (currentOrderNum) {
      fetchOrder(currentOrderNum);
    } else {
      setLoading(false);
    }
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const money = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return <div className="section min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-green" size={48} /></div>;
  }

  if (!order && orderNum) {
    return (
      <div className="section">
        <div className="container max-w-2xl text-center">
          <div className="card py-16 flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
              <AlertCircle size={48} />
            </div>
            <h2 className="text-2xl font-black text-dark">Order not found</h2>
            <p className="muted">We could not find the order associated with this payment page.</p>
            <Link to="/track-order" className="btn green">Find My Order</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!orderNum) {
    return (
      <div className="section">
        <div className="container max-w-2xl text-center">
          <div className="card py-16 flex flex-col items-center gap-6">
            <h2 className="text-2xl font-black text-dark">No Pending Payment</h2>
            <p className="muted">You don't have any active checkout session.</p>
            <Link to="/products" className="btn green">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="section bg-soft min-h-screen">
      <div className="container max-w-4xl">
        <div className="card text-center py-12 md:px-12 rounded-3xl shadow-2xl border-0 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-green"></div>
          
          <div className="w-20 h-20 bg-emerald-50 text-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 size={40} />
          </div>
          
          <div className="eyebrow">Checkout Flow</div>
          <h1 className="text-4xl md:text-5xl font-black text-dark mb-4 leading-tight tracking-tighter">Complete Your Payment</h1>
          
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Order Number:</span>
            <span className="font-black text-dark tracking-wider">{order.order_number}</span>
            <button 
              onClick={() => copyToClipboard(order.order_number, 'order')}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-green transition-colors"
              title="Copy Order Number"
            >
              {copied === 'order' ? <Check size={14} className="text-green" /> : <Copy size={14} />}
            </button>
            <button 
              onClick={() => fetchOrder(orderNum)}
              disabled={loading}
              className="ml-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-green transition-colors"
              title="Refresh Order Status"
            >
              <Clock size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {success && (
            <div className="notice mb-10 bg-emerald-50 border-emerald-200 text-emerald-800 rounded-2xl p-6 flex items-start gap-4 text-left">
              <CheckCircle2 className="shrink-0 text-green" size={24} />
              <div>
                <strong className="block mb-1 font-black">Receipt Uploaded!</strong>
                <p className="text-sm font-medium leading-relaxed">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="notice error mb-10 bg-rose-50 border-rose-200 text-rose-800 rounded-2xl p-6 flex items-start gap-4 text-left">
              <AlertCircle className="shrink-0 text-rose-500" size={24} />
              <p className="text-sm font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {order.payment_status === 'PAYMENT_REJECTED' && (
            <div className="notice error mb-10 bg-rose-50 border-rose-200 text-rose-800 rounded-2xl p-6 flex items-start gap-4 text-left">
              <XCircle className="shrink-0 text-rose-500" size={24} />
              <div>
                <strong className="block mb-1 font-black uppercase tracking-tight">Payment Proof Rejected</strong>
                <p className="text-sm font-medium leading-relaxed">{order.rejection_reason || 'Please upload a valid payment receipt.'}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7 space-y-6">
              <div className="card bg-slate-50 border-slate-100 py-12 flex flex-col items-center justify-center rounded-2xl">
                <div className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2">Total Amount Payable</div>
                <div className="text-5xl font-black text-dark mb-4 tracking-tighter">{money(order.total)}</div>
                <span className={twMerge(
                  "status px-6 py-2 rounded-full font-black tracking-widest",
                  order.payment_status === 'PAYMENT_CONFIRMED' || order.payment_status === 'PAYMENT_PROOF_SUBMITTED' ? 'green' : 'orange'
                )}>
                  {order.payment_status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="card text-left space-y-6 rounded-2xl border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-dark text-xl tracking-tight">Step 1: Bank Transfer</h3>
                  <div className="px-3 py-1 bg-green/10 text-green text-[10px] font-black uppercase tracking-widest rounded-full">Manual Transfer</div>
                </div>
                
                <div className="bg-white border border-slate-100 p-8 rounded-2xl space-y-6 shadow-sm">
                  <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Bank Name</div>
                      <div className="font-black text-dark text-lg uppercase">{settings.bankName || 'Fidelity Bank'}</div>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(settings.bankName || 'Fidelity Bank', 'bank')}
                      className="text-slate-300 hover:text-green"
                    >
                      {copied === 'bank' ? <Check size={16} className="text-green" /> : <Copy size={16} />}
                    </button>
                  </div>

                  <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Account Name</div>
                      <div className="font-black text-dark text-lg uppercase tracking-tight">{settings.bankAccountName || 'PEACE OKONGWO'}</div>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(settings.bankAccountName || 'PEACE OKONGWO', 'name')}
                      className="text-slate-300 hover:text-green"
                    >
                      {copied === 'name' ? <Check size={16} className="text-green" /> : <Copy size={16} />}
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Account Number</div>
                      <div className="text-3xl font-black text-dark tracking-widest font-mono">{settings.bankAccountNumber || '6052773663'}</div>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(settings.bankAccountNumber || '6052773663', 'acc')}
                      className="btn green p-4 rounded-xl shadow-lg shadow-green/20"
                    >
                      {copied === 'acc' ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>
                
                <p className="text-[11px] font-bold text-slate-400 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed italic">
                  <strong>Important:</strong> Please use your Order Number <span className="text-dark font-black underline">{order.order_number}</span> as the transfer narration/reference.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              {(order.payment_status === 'WAITING_FOR_PAYMENT' || order.payment_status === 'PAYMENT_REJECTED') ? (
                <div className="flex flex-col gap-6 h-full">
                  <div className="card bg-dark text-white border-0 p-8 flex-grow rounded-2xl flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-black text-xl tracking-tight uppercase">Step 2: Upload Proof</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <ImageUpload 
                        label="Select Receipt Screenshot"
                        currentImage={tempReceiptUrl}
                        onUploadSuccess={(url) => setTempReceiptUrl(url)}
                        onRemove={() => setTempReceiptUrl('')}
                        folder="receipts"
                      />

                      <div className="pt-4">
                        <button 
                          onClick={submitReceipt}
                          disabled={uploading || !tempReceiptUrl}
                          className={twMerge(
                            "btn w-full py-4 text-base font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all",
                            tempReceiptUrl 
                              ? "green shadow-xl shadow-green/20" 
                              : "bg-white/10 text-white/20 cursor-not-allowed border border-white/5"
                          )}
                        >
                          {uploading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                          I have made payments
                        </button>
                        {!tempReceiptUrl && (
                          <p className="text-[9px] text-center mt-3 font-black uppercase tracking-widest text-white/30">
                            Please upload receipt to continue
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card bg-emerald-50 border-emerald-100 flex flex-col items-center justify-center gap-6 text-center h-full rounded-2xl py-12">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-green shadow-xl shadow-green/10">
                    <CheckCircle2 size={48} />
                  </div>
                  <div>
                    <h3 className="font-black text-emerald-900 text-2xl mb-2 tracking-tight">Payment Received</h3>
                    <p className="text-sm text-emerald-700 font-bold leading-relaxed px-6">
                      {order.payment_status === 'PAYMENT_CONFIRMED' 
                        ? 'Your payment has been successfully confirmed. We are now processing your shipment.' 
                        : 'Your proof has been received! Our admin team is verifying the transfer right now.'}
                    </p>
                  </div>
                  <Link to={`/track-order?order=${order.order_number}`} className="btn green w-full max-w-[240px] py-4 text-base rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-green/20">
                    Track Progress <ArrowRight size={20} />
                  </Link>
                </div>
              )}
              
              <div className="card bg-white p-8 rounded-2xl border-slate-100">
                <h4 className="font-black text-dark uppercase tracking-widest text-[10px] mb-4">Need Help?</h4>
                <div className="space-y-3 text-left">
                  <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-3 text-sm font-bold text-slate-500 hover:text-green transition-colors">
                    <Phone size={16} className="text-green" /> {settings.contactPhone || '07083912427'}
                  </a>
                  <a href={`https://wa.me/${settings.socialWhatsapp}`} target="_blank" className="flex items-center gap-3 text-sm font-bold text-slate-500 hover:text-green transition-colors">
                    <MessageSquare size={16} className="text-green" /> Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          {order.payment_status !== 'PAYMENT_CONFIRMED' && (
            <div className="mt-12 flex flex-col items-center gap-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic animate-pulse">
                Keep this page open or bookmark it until confirmed.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, updateDoc, doc, query, orderBy, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ExternalLink, CheckCircle2, Clock, Truck, Copy, Trash2, Save } from 'lucide-react';
import { formatDateTime, getDateMillis } from '../../lib/dateUtils';

export function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      const fetchedOrders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Sort in memory safely
      fetchedOrders.sort((a: any, b: any) => {
        const dateA = getDateMillis(a.created_at || a.createdAt);
        const dateB = getDateMillis(b.created_at || b.createdAt);
        return dateB - dateA;
      });
      
      setOrders(fetchedOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdate = async (id: string, field: string, value: string) => {
    setUpdating(id);
    try {
      await updateDoc(doc(db, 'orders', id), {
        [field]: value,
        updated_at: serverTimestamp()
      });
      fetchOrders();
    } catch (err: any) {
      console.error("Update Error:", err);
      let msg = 'Failed to update order.';
      if (err.code === 'permission-denied') {
        msg = 'Permission Denied: Ensure you have admin access or check Firestore rules.';
      }
      alert(msg);
    } finally {
      setUpdating(null);
    }
  };

  const handleSaveEdit = async (id: string) => {
    setUpdating(id);
    try {
      await updateDoc(doc(db, 'orders', id), {
        ...editData,
        updated_at: serverTimestamp()
      });
      setEditingOrder(null);
      fetchOrders();
    } catch (err: any) {
      console.error("Edit Save Error:", err);
      let msg = 'Failed to save changes.';
      if (err.code === 'permission-denied') {
        msg = 'Permission Denied: Access restricted.';
      }
      alert(msg);
      setUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    setUpdating(id);
    try {
      await deleteDoc(doc(db, 'orders', id));
      fetchOrders();
    } catch (err: any) {
      console.error("Delete Error:", err);
      let msg = 'Failed to delete order.';
      if (err.code === 'permission-denied') {
        msg = 'Permission Denied: Access restricted.';
      }
      alert(msg);
      setUpdating(null);
    }
  };

  const clearDelivered = async () => {
    const deliveredOrders = orders.filter(o => o.order_status === 'Delivered' || o.order_status === 'Cancelled');
    if (deliveredOrders.length === 0) {
      alert('No delivered or cancelled orders to clear.');
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete all ${deliveredOrders.length} delivered/cancelled orders?`)) return;
    
    setLoading(true);
    try {
      for (const o of deliveredOrders) {
        await deleteDoc(doc(db, 'orders', o.id));
      }
      fetchOrders();
      alert('Orders cleared successfully.');
    } catch (err) {
      alert('Failed to clear some orders.');
      fetchOrders();
    }
  };

  const money = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(val);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-96 bg-white rounded"></div></div>;

  const paymentOptions = ['WAITING_FOR_PAYMENT', 'PAYMENT_PROOF_SUBMITTED', 'PAYMENT_CONFIRMED', 'PAYMENT_REJECTED'];
  const statusOptions = ['Pending', 'Confirmed', 'Processing', 'Ready for Delivery', 'Delivered', 'Cancelled'];

  return (
    <div className="space-y-10">
      <div className="admin-head">
        <div>
          <div className="eyebrow">Sales</div>
          <h1 className="text-3xl font-black text-dark">Orders</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={clearDelivered}
            className="btn outline border-rose-200 text-rose-500 hover:bg-rose-50 px-6 py-2 text-xs font-black uppercase tracking-widest"
          >
            Clear Delivered
          </button>
          <button onClick={fetchOrders} className="btn green px-6 py-2 text-xs font-black uppercase tracking-widest">
            Refresh List
          </button>
        </div>
      </div>

      <div className="table-wrap rounded-xl bg-white shadow-sm border border-line">
        <table>
          <thead>
            <tr>
              <th>Order / Date</th>
              <th>Customer</th>
              <th>Total / Receipt</th>
              <th>Payment Status</th>
              <th>Order Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className={updating === o.id ? 'opacity-50' : ''}>
                <td>
                  <div className="flex items-center gap-2">
                    <b className="text-dark tracking-wider">{o.order_number || o.trackingNumber || o.id.slice(0, 8)}</b>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(o.order_number || o.trackingNumber || o.id);
                        alert('Order number copied!');
                      }}
                      className="p-1 rounded bg-slate-100 text-slate-400 hover:text-green"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                  <div className="text-[10px] text-muted font-bold mt-1">
                    {formatDateTime(o.created_at || o.createdAt)}
                  </div>
                </td>
                <td>
                  {editingOrder === o.id ? (
                    <div className="space-y-2">
                      <input 
                        className="input text-xs p-2" 
                        value={editData.customer_name} 
                        onChange={(e) => setEditData({...editData, customer_name: e.target.value})}
                      />
                      <input 
                        className="input text-xs p-2" 
                        value={editData.customer_phone} 
                        onChange={(e) => setEditData({...editData, customer_phone: e.target.value})}
                      />
                      <textarea 
                        className="input text-xs p-2 h-16" 
                        value={editData.delivery_address} 
                        onChange={(e) => setEditData({...editData, delivery_address: e.target.value})}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="font-bold text-dark">{o.customer_name}</div>
                      <div className="text-xs text-muted">{o.customer_email}</div>
                      <div className="text-xs text-muted">{o.customer_phone}</div>
                      {o.sender_name && <div className="text-[10px] font-bold text-green mt-1">Sender: {o.sender_name}</div>}
                      {o.sender_account && <div className="text-[10px] font-bold text-green">Account: {o.sender_account}</div>}
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{o.delivery_address}</div>
                    </>
                  )}
                </td>
                <td>
                  <div className="font-black text-dark">{money(o.total)}</div>
                </td>
                <td>
                   <div className="space-y-2">
                    <select 
                      value={o.payment_status}
                      onChange={(e) => handleUpdate(o.id, 'payment_status', e.target.value)}
                      className={`status outline-none cursor-pointer w-full ${o.payment_status === 'PAYMENT_CONFIRMED' ? 'green' : 'orange'}`}
                    >
                      {paymentOptions.map(opt => (
                        <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
                      ))}
                    </select>

                    {o.payment_status === 'PAYMENT_PROOF_SUBMITTED' && (
                      <button 
                        onClick={async () => {
                          setUpdating(o.id);
                          try {
                            await updateDoc(doc(db, 'orders', o.id), {
                              payment_status: 'PAYMENT_CONFIRMED',
                              order_status: 'Confirmed',
                              updated_at: serverTimestamp()
                            });
                            fetchOrders();
                          } catch (err) {
                            alert('Failed to confirm payment.');
                          } finally {
                            setUpdating(null);
                          }
                        }}
                        className="btn green w-full py-2 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 size={12} /> Confirm Receipt
                      </button>
                    )}
                  </div>
                </td>
                <td>
                  <select 
                    value={o.order_status}
                    onChange={(e) => handleUpdate(o.id, 'order_status', e.target.value)}
                    className={`status outline-none cursor-pointer ${o.order_status === 'Delivered' ? 'green' : 'orange'}`}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <div className="flex gap-2">
                    {editingOrder === o.id ? (
                      <>
                        <button 
                          onClick={() => handleSaveEdit(o.id)}
                          className="btn green p-2 rounded-lg"
                        >
                          <Save size={18} />
                        </button>
                        <button 
                          onClick={() => setEditingOrder(null)}
                          className="btn outline p-2 rounded-lg"
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          disabled={updating === o.id}
                          onClick={() => {
                            setEditingOrder(o.id);
                            setEditData({
                              customer_name: o.customer_name,
                              customer_phone: o.customer_phone,
                              delivery_address: o.delivery_address
                            });
                          }}
                          className="btn outline p-2 rounded-lg"
                        >
                          Edit
                        </button>
                        <button 
                          disabled={updating === o.id}
                          onClick={() => fetchOrders()}
                          className="btn outline p-2 rounded-lg"
                        >
                          Refresh
                        </button>
                      </>
                    )}
                    {(o.order_status === 'Delivered' || o.order_status === 'Cancelled') && (
                      <button 
                        disabled={updating === o.id}
                        onClick={() => handleDelete(o.id)}
                        className="btn bg-rose-500 hover:bg-rose-600 text-white p-2 rounded-lg transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-20 text-muted font-bold italic">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

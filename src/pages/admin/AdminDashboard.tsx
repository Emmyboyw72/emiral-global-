import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { Package, ShoppingCart, MessageSquare, AlertCircle } from 'lucide-react';
import { formatDate, getDateMillis } from '../../lib/dateUtils';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    activeOrders: 0,
    messages: 0
  });
  const [latestOrders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const prodSnap = await getDocs(collection(db, 'products'));
        const orderSnap = await getDocs(collection(db, 'orders'));
        const msgSnap = await getDocs(query(collection(db, 'contact_messages'))).catch(() => ({ docs: [], size: 0 }));

        const orders = orderSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const active = orders.filter((o: any) => {
          const st = o.order_status || o.status || 'Pending';
          return ['Pending', 'Confirmed', 'Processing', 'Delivery requested', 'Out for delivery'].includes(st);
        }).length;

        const newMsgs = (msgSnap as any).docs?.filter((d: any) => d.data().status === 'new').length || 0;

        setStats({
          products: prodSnap.size,
          orders: orderSnap.size,
          activeOrders: active,
          messages: newMsgs
        });

        // Get latest orders - safe sorting with date millis
        const allOrders = [...orders];
        allOrders.sort((a: any, b: any) => {
          const dateA = getDateMillis(a.created_at || a.createdAt);
          const dateB = getDateMillis(b.created_at || b.createdAt);
          return dateB - dateA;
        });

        setOrders(allOrders.slice(0, 8));
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const money = (val: number) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(num);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-xl"></div>)}
        </div>
        <div className="h-96 bg-white rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="admin-head">
        <div>
          <div className="eyebrow">Overview</div>
          <h1 className="text-3xl font-black text-dark">Dashboard</h1>
        </div>
      </div>

      <div className="grid cols-4">
        <div className="card">
          <span className="muted text-xs font-black uppercase tracking-widest block mb-2">Products</span>
          <div className="flex items-end justify-between">
            <strong className="text-4xl text-dark">{stats.products}</strong>
            <Package className="text-green/20" size={32} />
          </div>
        </div>
        <div className="card">
          <span className="muted text-xs font-black uppercase tracking-widest block mb-2">Total Orders</span>
          <div className="flex items-end justify-between">
            <strong className="text-4xl text-dark">{stats.orders}</strong>
            <ShoppingCart className="text-green/20" size={32} />
          </div>
        </div>
        <div className="card border-green/30">
          <span className="muted text-xs font-black uppercase tracking-widest block mb-2">Active Orders</span>
          <div className="flex items-end justify-between">
            <strong className="text-4xl text-green">{stats.activeOrders}</strong>
            <AlertCircle className="text-green/20" size={32} />
          </div>
        </div>
        <div className="card">
          <span className="muted text-xs font-black uppercase tracking-widest block mb-2">New Messages</span>
          <div className="flex items-end justify-between">
            <strong className="text-4xl text-dark">{stats.messages}</strong>
            <MessageSquare className="text-green/20" size={32} />
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <div className="admin-head flex justify-between items-end">
          <h2 className="text-xl font-black text-dark">Latest Orders</h2>
          <a href="/admin/orders" className="text-xs font-black text-green uppercase tracking-widest hover:underline">View All</a>
        </div>

        <div className="table-wrap rounded-xl bg-white shadow-sm border border-line">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {latestOrders.map((o) => {
                const orderNum = o.order_number || o.trackingNumber || `ORD-${o.id.slice(0, 6)}`;
                const custName = o.customer_name || o.receiverName || o.senderName || 'Customer';
                const pStatus = (o.payment_status || (o.paymentConfirmedInUI ? 'CONFIRMED' : 'WAITING_FOR_PAYMENT')).toString();
                const oStatus = (o.order_status || o.status || 'Pending').toString();
                const totalAmount = o.total ?? (o.subtotal ? o.subtotal + (o.delivery_fee || 0) : 0);

                return (
                  <tr key={o.id}>
                    <td><b className="text-dark tracking-wider">{orderNum}</b></td>
                    <td>{custName}</td>
                    <td className="font-black text-dark">{money(totalAmount)}</td>
                    <td>
                      <span className={`status ${pStatus.includes('CONFIRM') ? 'green' : 'orange'}`}>
                        {pStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${oStatus.toLowerCase().includes('deliver') ? 'green' : 'orange'}`}>
                        {oStatus}
                      </span>
                    </td>
                    <td className="text-muted">{formatDate(o.created_at || o.createdAt)}</td>
                  </tr>
                );
              })}
              {latestOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-muted font-bold italic">No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

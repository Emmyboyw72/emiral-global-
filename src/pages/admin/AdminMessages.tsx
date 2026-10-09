import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { Mail, Phone, Clock, Trash2, CheckCircle } from 'lucide-react';
import { formatDateTime, getDateMillis } from '../../lib/dateUtils';

export function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'contact_messages'));
      const fetchedMessages = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Sort in memory safely
      fetchedMessages.sort((a: any, b: any) => {
        const dateA = getDateMillis(a.created_at || a.createdAt);
        const dateB = getDateMillis(b.created_at || b.createdAt);
        return dateB - dateA;
      });
      
      setMessages(fetchedMessages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'contact_messages', id), { status });
      fetchMessages();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this message?')) {
      try {
        await deleteDoc(doc(db, 'contact_messages', id));
        fetchMessages();
      } catch (err) {
        alert('Failed to delete message.');
      }
    }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-96 bg-white rounded"></div></div>;

  return (
    <div className="space-y-10">
      <div className="admin-head">
        <div>
          <div className="eyebrow">Support</div>
          <h1 className="text-3xl font-black text-dark">Contact Messages</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {messages.map((m) => (
          <div key={m.id} className="card">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-4 flex-grow">
                <div className="flex items-center gap-3">
                  <b className="text-lg text-dark">{m.name}</b>
                  <span className={`status ${m.status === 'new' ? 'orange' : 'green'}`}>
                    {m.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-6 text-xs font-bold text-muted uppercase tracking-widest">
                  <span className="flex items-center gap-2"><Mail size={14} className="text-green" /> {m.email}</span>
                  <span className="flex items-center gap-2"><Phone size={14} className="text-green" /> {m.phone || 'N/A'}</span>
                  <span className="flex items-center gap-2"><Clock size={14} className="text-green" /> {formatDateTime(m.created_at || m.createdAt)}</span>
                </div>

                <div className="pt-4 border-t border-line">
                  <h4 className="font-black text-dark mb-2">{m.subject}</h4>
                  <p className="text-muted leading-relaxed whitespace-pre-line">{m.message}</p>
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-2 shrink-0">
                {m.status === 'new' && (
                  <button onClick={() => handleStatus(m.id, 'read')} className="btn outline flex items-center gap-2 py-3 px-4">
                    <CheckCircle size={16} /> Mark Read
                  </button>
                )}
                <button onClick={() => handleDelete(m.id)} className="btn danger flex items-center gap-2 py-3 px-4">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="empty">No messages received yet.</div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Calendar } from 'lucide-react';

export function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset } = useForm();

  const fetchEvents = async () => {
    const snap = await getDocs(collection(db, 'events'));
    const fetchedEvents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Sort in memory by date
    fetchedEvents.sort((a: any, b: any) => (a.event_date || '').localeCompare(b.event_date || ''));
    
    setEvents(fetchedEvents);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const onSubmit = async (data: any) => {
    try {
      await addDoc(collection(db, 'events'), { ...data, created_at: serverTimestamp() });
      reset();
      fetchEvents();
    } catch (err: any) {
      console.error(err);
      const isPerm = err?.code === 'permission-denied' || err?.message?.includes('permission');
      alert(isPerm 
        ? 'Permission Denied: Please update your Firestore Security Rules in Firebase Console to allow write access.' 
        : `Failed to save event: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this event?')) {
      await deleteDoc(doc(db, 'events', id));
      fetchEvents();
    }
  };

  if (loading) return <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green mx-auto mt-20"></div>;

  return (
    <div className="space-y-10">
      <div className="admin-head">
        <h1 className="text-3xl font-black text-dark">Community Events</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 h-fit">
          <h2 className="text-xl font-black text-dark mb-4">Add New Event</h2>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Title</label>
            <input {...register('title', { required: true })} className="input" />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Date</label>
            <input type="date" {...register('event_date', { required: true })} className="input" />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Location</label>
            <input {...register('location', { required: true })} className="input" />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Description</label>
            <textarea {...register('description')} className="input h-32" />
          </div>
          <button type="submit" className="btn green w-full py-4 flex items-center justify-center gap-2">
            <Plus size={18} /> Add Event
          </button>
        </form>

        <div className="space-y-4">
          {events.map((ev) => (
            <div key={ev.id} className="card relative group flex items-start gap-6">
               <div className="w-16 h-16 bg-soft rounded-2xl flex flex-col items-center justify-center border border-line text-dark">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">EVENT</span>
                  <Calendar size={20} />
               </div>
               <div className="flex-grow">
                  <h3 className="font-black text-dark text-lg mb-1">{ev.title}</h3>
                  <div className="text-[10px] font-black text-green uppercase tracking-widest mb-2">{ev.event_date} • {ev.location}</div>
                  <p className="text-muted text-sm leading-relaxed">{ev.description}</p>
               </div>
               <button onClick={() => handleDelete(ev.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {events.length === 0 && <div className="empty">No events yet.</div>}
        </div>
      </div>
    </div>
  );
}

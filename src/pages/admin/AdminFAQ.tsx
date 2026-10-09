import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Save } from 'lucide-react';

export function AdminFAQ() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset } = useForm();
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchFaqs = async () => {
    try {
      const snap = await getDocs(collection(db, 'faqs'));
      setFaqs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchFaqs(); 
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await addDoc(collection(db, 'faqs'), { 
        ...data, 
        created_at: serverTimestamp() 
      });
      reset();
      fetchFaqs();
    } catch (err: any) {
      console.error(err);
      const isPerm = err?.code === 'permission-denied' || err?.message?.includes('permission');
      alert(isPerm 
        ? 'Permission Denied: Please update your Firestore Security Rules in Firebase Console to allow write access.' 
        : `Failed to add FAQ: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, 'faqs', id));
      fetchFaqs();
    } catch (err) {
      console.error(err);
      alert('Failed to delete FAQ.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4 pt-20"><div className="h-96 bg-white rounded-2xl"></div></div>;

  return (
    <div className="space-y-10">
      <div className="admin-head">
        <div>
          <div className="eyebrow">Content</div>
          <h1 className="text-3xl font-black text-dark">FAQ Management</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 h-fit border-0 shadow-xl">
          <h2 className="text-xl font-black text-dark mb-4">Add New FAQ</h2>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Question</label>
            <input {...register('question', { required: true })} className="input border-slate-100 focus:border-green" placeholder="e.g. How do I use the products?" />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Answer</label>
            <textarea {...register('answer', { required: true })} className="input h-32 border-slate-100 focus:border-green" placeholder="Provide a detailed answer..." />
          </div>
          <button type="submit" className="btn green w-full py-4 flex items-center justify-center gap-2 shadow-lg shadow-green/20">
            <Plus size={18} /> Add FAQ
          </button>
        </form>

        <div className="space-y-4">
          {faqs.map((f) => (
            <div key={f.id} className={`card relative border-0 shadow-sm hover:shadow-md transition-shadow ${deleting === f.id ? 'opacity-50' : ''}`}>
              <div className="flex justify-between items-start gap-4 mb-3">
                <h3 className="font-black text-dark pr-8">{f.question}</h3>
                <button 
                  disabled={deleting === f.id}
                  onClick={() => handleDelete(f.id)} 
                  className="text-slate-300 hover:text-rose-500 transition-colors p-2 -mr-2 -mt-2"
                  title="Delete FAQ"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="text-muted text-sm leading-relaxed">{f.answer}</p>
            </div>
          ))}
          {faqs.length === 0 && (
            <div className="card border-dashed border-2 border-slate-100 text-center py-20 text-muted font-bold italic">
              No FAQs yet. Add one to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

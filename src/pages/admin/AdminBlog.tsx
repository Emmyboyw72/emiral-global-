import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { formatDate, getDateMillis } from '../../lib/dateUtils';

export function AdminBlog() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'articles'));
      const fetchedArticles = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Sort in memory safely
      fetchedArticles.sort((a: any, b: any) => {
        const dateA = getDateMillis(a.created_at || a.createdAt);
        const dateB = getDateMillis(b.created_at || b.createdAt);
        return dateB - dateA;
      });
      
      setArticles(fetchedArticles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        updated_at: serverTimestamp()
      };
      if (editing) {
        await updateDoc(doc(db, 'articles', editing.id), payload);
      } else {
        await addDoc(collection(db, 'articles'), {
          ...payload,
          author: 'Emiral Admin',
          created_at: serverTimestamp()
        });
      }
      setEditing(null);
      reset();
      fetchArticles();
    } catch (err: any) {
      console.error(err);
      const isPerm = err?.code === 'permission-denied' || err?.message?.includes('permission');
      alert(isPerm 
        ? 'Permission Denied: Please update your Firestore Security Rules in Firebase Console to allow write access.' 
        : `Failed to save article: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleEdit = (a: any) => {
    setEditing(a);
    Object.keys(a).forEach(k => setValue(k, a[k]));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this article?')) {
      await deleteDoc(doc(db, 'articles', id));
      fetchArticles();
    }
  };

  if (loading && articles.length === 0) return <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green mx-auto mt-20"></div>;

  return (
    <div className="space-y-10">
      <div className="admin-head">
        <div>
          <div className="eyebrow">Insights</div>
          <h1 className="text-3xl font-black text-dark">Blog Management</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-6">
          {articles.map((a) => (
            <div key={a.id} className="card flex gap-6">
              <div className="w-24 h-24 bg-soft rounded-xl overflow-hidden shrink-0 border border-line">
                {a.featured_image ? <img src={a.featured_image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-300">NO IMAGE</div>}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black text-dark mb-1">{a.title}</h3>
                    <div className="text-[10px] font-black text-green uppercase tracking-widest mb-3">{a.category} • {formatDate(a.created_at || a.createdAt)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(a)} className="btn outline p-2"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(a.id)} className="btn danger p-2"><Trash2 size={14} /></button>
                  </div>
                </div>
                <p className="text-muted text-sm line-clamp-2">{a.excerpt}</p>
              </div>
            </div>
          ))}
          {articles.length === 0 && <div className="empty">No articles yet.</div>}
        </div>

        <aside className="card space-y-6 sticky top-8">
          <div className="flex justify-between items-center border-b border-line pb-4">
            <h2 className="text-xl font-black text-dark">{editing ? 'Edit Article' : 'New Article'}</h2>
            {editing && <button onClick={() => { setEditing(null); reset(); }} className="text-slate-400 hover:text-dark"><X size={20} /></button>}
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Title</label>
              <input {...register('title', { required: true })} className="input" />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Category</label>
              <input {...register('category')} className="input" placeholder="e.g. Wellness" />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Featured Image URL</label>
              <input {...register('featured_image')} className="input" />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Excerpt</label>
              <textarea {...register('excerpt')} className="input h-20" />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Content</label>
              <textarea {...register('content', { required: true })} className="input h-48" />
            </div>
            <button type="submit" className="btn green w-full py-4 flex items-center justify-center gap-2">
              <Save size={18} /> {editing ? 'Update Article' : 'Publish Article'}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}

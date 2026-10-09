import React, { useEffect, useState } from 'react';
import { db, storage } from '../../lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { Save, Loader2, Globe } from 'lucide-react';
import { ImageUpload } from '../../components/ImageUpload';

export function AdminContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);
  const { register, handleSubmit, setValue, watch } = useForm();
  
  const heroImage = watch('heroImage');
  const promoImage = watch('promoImage');
  const bodyImage1 = watch('bodyImage1');
  const bodyImage2 = watch('bodyImage2');
  const adVideoUrl = watch('adVideoUrl');

  useEffect(() => {
    async function fetchSettings() {
      const settings: any = {};
      try {
        const snap = await getDocs(collection(db, 'settings'));
        snap.forEach(d => {
          settings[d.id] = d.data().value;
        });
      } catch (err) {
        console.warn('Firestore settings fetch issue:', err);
      }

      // Merge local overrides
      const local = localStorage.getItem('emiral_settings_override');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          Object.assign(settings, parsed);
        } catch (e) {}
      }

      Object.keys(settings).forEach(key => setValue(key, settings[key]));
      setLoading(false);
    }
    fetchSettings();
  }, [setValue]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    setStatusMessage(null);

    // 1. Always save locally immediately so user never loses work
    try {
      localStorage.setItem('emiral_settings_override', JSON.stringify(data));
    } catch (e) {}

    // 2. Sync to Firestore
    try {
      for (const key of Object.keys(data)) {
        if (data[key] !== undefined) {
          await setDoc(doc(db, 'settings', key), { value: data[key], updated_at: serverTimestamp() });
        }
      }
      setStatusMessage({ type: 'success', text: 'All settings saved and synced to database successfully!' });
    } catch (err: any) {
      console.error('Firestore save settings error:', err);
      if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
        setStatusMessage({ 
          type: 'warning', 
          text: 'Saved to your browser! However, Firestore rejected cloud sync (Permission Denied). Please update your Firestore security rules in Firebase Console to sync across all devices.' 
        });
      } else {
        setStatusMessage({ type: 'error', text: `Saved locally, but cloud sync failed: ${err?.message || 'Network error'}` });
      }
    } finally {
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green mx-auto mt-20"></div>;

  return (
    <div className="space-y-10 max-w-5xl">
      <div className="admin-head">
        <div>
          <div className="eyebrow">CMS</div>
          <h1 className="text-3xl font-black text-dark">Website Content</h1>
          <p className="muted text-sm">Manage homepage text, media, contact details and payment instructions.</p>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-4 shadow-sm ${
          statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
          statusMessage.type === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
          'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{statusMessage.text}</span>
          <button type="button" onClick={() => setStatusMessage(null)} className="opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
        <section className="card space-y-6">
          <h2 className="text-xl font-black text-dark flex items-center gap-3">
             Site Announcements & Branding
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Top Marquee Banner Text</label>
              <textarea {...register('promoBanner')} className="input" placeholder="e.g. Discover Premium Herbal Wellness Products Created for Holistic Healing •" />
              <p className="text-[10px] mt-1 text-slate-400 italic">This scrolls at the very top of the website.</p>
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Footer Description</label>
              <textarea {...register('footerDescription')} className="input" placeholder="Natural Health • Herbal Wellness. Emiral Global supports holistic wellness..." />
            </div>
          </div>
        </section>

        <section className="card space-y-6">
          <h2 className="text-xl font-black text-dark">Homepage Hero</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Hero Headline (Use \n for line breaks)</label>
                <textarea {...register('heroTitle')} className="input h-24" placeholder="NATURALWELL\nNESS.ROOTED\nINPURPOSE." />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Hero Sub-headline (Mission Statement)</label>
                <textarea {...register('heroSubtitle')} className="input h-32" />
              </div>
            </div>
            <div>
              <ImageUpload 
                label="Hero Image"
                currentImage={heroImage}
                onUploadSuccess={(url) => setValue('heroImage', url)}
                onRemove={() => setValue('heroImage', '')}
                folder="settings"
              />
            </div>
          </div>
        </section>

        <section className="card space-y-6">
          <h2 className="text-xl font-black text-dark">Welcome & Community Sections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Welcome Headline</label>
              <input {...register('welcomeTitle')} className="input" placeholder="We bring the best of nature to your doorstep." />
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Welcome Text</label>
              <textarea {...register('welcomeText')} className="input h-24" />
              <ImageUpload 
                label="Welcome Image"
                currentImage={bodyImage1}
                onUploadSuccess={(url) => setValue('bodyImage1', url)}
                onRemove={() => setValue('bodyImage1', '')}
                folder="settings"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Community Headline</label>
              <input {...register('communityTitle')} className="input" placeholder="A network built on trust and shared success." />
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Community Text</label>
              <textarea {...register('communityText')} className="input h-24" />
              <ImageUpload 
                label="Community Image"
                currentImage={bodyImage2}
                onUploadSuccess={(url) => setValue('bodyImage2', url)}
                onRemove={() => setValue('bodyImage2', '')}
                folder="settings"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-line">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Video Ad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ImageUpload 
                label="Upload Video Ad"
                currentImage={adVideoUrl ? undefined : undefined} // Not showing preview here for video
                onUploadSuccess={(url) => setValue('adVideoUrl', url)}
                folder="ads"
                accept="video/*"
              />
              <div className="aspect-video bg-dark rounded-xl flex items-center justify-center text-white/20 text-[10px] font-black uppercase tracking-widest border border-dark overflow-hidden">
                {adVideoUrl ? (
                  <video src={adVideoUrl} controls className="w-full h-full object-cover" />
                ) : (
                  <span>Video Preview</span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="card space-y-6">
          <h2 className="text-xl font-black text-dark">About Page Content</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">About Headline</label>
              <input {...register('aboutTitle')} className="input" placeholder="About Emiral Global" />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">About Description</label>
              <textarea {...register('aboutSubtitle')} className="input h-24" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Mission Statement</label>
                <textarea {...register('aboutMission')} className="input h-32" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Vision Statement</label>
                <textarea {...register('aboutVision')} className="input h-32" />
              </div>
            </div>
          </div>
        </section>

        <section className="card space-y-6">
          <h2 className="text-xl font-black text-dark">Wellness & Wisdom Page</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Wellness Page Title</label>
              <input {...register('wellnessTitle')} className="input" placeholder="Herbal Wisdom" />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Wellness Page Sub-headline</label>
              <textarea {...register('wellnessSubtitle')} className="input h-24" />
            </div>
          </div>
        </section>

        <section className="card space-y-6">
          <h2 className="text-xl font-black text-dark">Business Opportunity Page</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Opportunity Page Title</label>
              <input {...register('oppTitle')} className="input" placeholder="Herbal Distribution Opportunity" />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Opportunity Page Sub-headline</label>
              <textarea {...register('oppSubtitle')} className="input h-24" />
            </div>
          </div>
        </section>

        <section className="card space-y-6">
          <h2 className="text-xl font-black text-dark">Official Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Customer Support Email</label>
              <input {...register('contactEmail')} className="input" type="email" />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Support Phone</label>
              <input {...register('contactPhone')} className="input" />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">WhatsApp Number</label>
              <input {...register('socialWhatsapp')} className="input" placeholder="234..." />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Headquarters Address</label>
            <input {...register('contactAddress')} className="input" />
          </div>
        </section>

        <section className="card space-y-6">
          <h2 className="text-xl font-black text-dark">Bank Transfer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Bank Name</label>
              <input {...register('bankName')} className="input" />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Account Name</label>
              <input {...register('bankAccountName')} className="input" />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Account Number</label>
              <input {...register('bankAccountNumber')} className="input" />
            </div>
          </div>
        </section>

        <div className="fixed bottom-6 right-6 xl:right-12 z-50">
          <button 
            type="submit" 
            disabled={saving}
            className="btn green shadow-2xl px-10 py-5 text-base rounded-2xl flex items-center gap-3 transition-transform active:scale-95"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
}

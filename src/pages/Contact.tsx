import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useSettings } from '../lib/useSettings';

export function Contact() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { settings } = useSettings();

  const onSubmit = async (data: any) => {
    try {
      setError('');
      await addDoc(collection(db, 'contact_messages'), {
        ...data,
        status: 'new',
        created_at: serverTimestamp()
      });
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError('Failed to send message. Please try again.');
      console.error(err);
    }
  };

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow text-white/60">Contact Support</div>
          <h1>Contact Emiral Global</h1>
          <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-black text-dark mb-8">We would like to hear from you.</h2>
            <p className="muted mb-12 text-lg">For product, order, distributor or general enquiries, use the form. Our team is ready to support you.</p>
            
            <div className="space-y-6">
              <div className="card flex items-start gap-6">
                <div className="w-12 h-12 bg-green/10 rounded-xl flex items-center justify-center text-green shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-dark mb-1">Phone</h4>
                  <p className="muted text-sm">{settings.contactPhone || "07083912427"}</p>
                </div>
              </div>
              
              <div className="card flex items-start gap-6">
                <div className="w-12 h-12 bg-green/10 rounded-xl flex items-center justify-center text-green shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-dark mb-1">Email</h4>
                  <p className="muted text-sm">{settings.contactEmail || "emiralglobal@gmail.com"}</p>
                </div>
              </div>
              
              <div className="card flex items-start gap-6">
                <div className="w-12 h-12 bg-green/10 rounded-xl flex items-center justify-center text-green shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-dark mb-1">Address</h4>
                  <p className="muted text-sm">{settings.contactAddress || "101 Allen Avenue Ikeja Lagos, Nigeria"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {success && (
                <div className="notice mb-6">
                  Your message has been received. Emiral Global will review it shortly.
                </div>
              )}
              
              {error && (
                <div className="notice error mb-6">
                  {error}
                </div>
              )}

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Full Name *</label>
                <input 
                  {...register('name', { required: true })}
                  className="input" 
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-rose-500 text-[10px] mt-1 font-bold uppercase">Required</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Email *</label>
                  <input 
                    {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                    type="email"
                    className="input" 
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-rose-500 text-[10px] mt-1 font-bold uppercase">Valid email required</p>}
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Phone</label>
                  <input 
                    {...register('phone')}
                    className="input" 
                    placeholder="+234..."
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Subject</label>
                <input 
                  {...register('subject')}
                  className="input" 
                  placeholder="Order Inquiry"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Message *</label>
                <textarea 
                  {...register('message', { required: true })}
                  className="input h-32 resize-none" 
                  placeholder="How can we help you?"
                />
                {errors.message && <p className="text-rose-500 text-[10px] mt-1 font-bold uppercase">Required</p>}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn green w-full py-4 text-base flex items-center gap-2"
              >
                {isSubmitting ? 'Sending...' : <><Send size={18} /> Send Message</>}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

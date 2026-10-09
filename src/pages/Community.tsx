import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export function Community() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const snap = await getDocs(collection(db, 'events'));
        const fetchedEvents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Sort in memory by date
        fetchedEvents.sort((a: any, b: any) => (a.event_date || '').localeCompare(b.event_date || ''));
        
        setEvents(fetchedEvents);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow text-white/60">Events & Community</div>
          <h1>Emiral Community</h1>
          <p>See upcoming seminars, launches and community activities. We are more than just products.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
            </div>
          ) : (
            <div className="grid cols-3">
              {events.map(ev => (
                <article key={ev.id} className="card overflow-hidden p-0 group">
                  {ev.image && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img 
                        src={ev.image} 
                        alt={ev.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                  )}
                  <div className="p-8">
                    <div className="eyebrow">{new Date(ev.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    <h3 className="text-xl font-black mb-4">{ev.title}</h3>
                    <p className="muted mb-6 text-sm leading-relaxed">{ev.description}</p>
                    <div className="pt-6 border-t border-slate-100 font-bold text-xs uppercase tracking-widest text-dark">
                      {ev.location}, {ev.country || 'Nigeria'}
                    </div>
                  </div>
                </article>
              ))}

              {events.length === 0 && (
                <div className="col-span-full empty">
                  No upcoming events.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

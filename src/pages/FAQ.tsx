import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export function FAQ() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const q = query(collection(db, 'faqs'));
        const snap = await getDocs(q);
        setFaqs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFaqs();
  }, []);

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow text-white/60">Help Center</div>
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about our products, business opportunity, and community.</p>
        </div>
      </section>

      <section className="section">
        <div className="container max-w-3xl">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {faqs.map((f, i) => (
                <details key={f.id || i} className="faq group">
                  <summary className="py-6">{f.question}</summary>
                  <div className="pb-8">
                    <p className="muted leading-relaxed">{f.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          )}
          
          {!loading && faqs.length === 0 && (
            <div className="empty">
              No FAQs available.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export function Blog() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const snap = await getDocs(collection(db, 'articles'));
        const fetchedArticles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Sort in memory by date descending
        fetchedArticles.sort((a: any, b: any) => {
          const dateA = a.created_at?.toDate()?.getTime() || 0;
          const dateB = b.created_at?.toDate()?.getTime() || 0;
          return dateB - dateA;
        });
        
        setArticles(fetchedArticles);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow text-white/60">Insights</div>
          <h1>Latest Updates</h1>
          <p>Expert advice, community stories, and the latest news from the world of natural wellness.</p>
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
              {articles.map(a => (
                <article key={a.id} className="card p-0 overflow-hidden flex flex-col h-full group">
                  {a.featured_image && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img 
                        src={a.featured_image} 
                        alt={a.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                  )}
                  <div className="p-8 flex flex-col flex-grow">
                    <span className="tag">{a.category}</span>
                    <h3 className="text-xl font-black mb-4 group-hover:text-green transition-colors">{a.title}</h3>
                    <p className="muted mb-6 text-sm flex-grow leading-relaxed">{a.excerpt}</p>
                    
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {a.author || 'Admin'} • {a.created_at?.toDate().toLocaleDateString('en-GB')}
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {articles.length === 0 && (
                <div className="col-span-full empty">
                  No articles available.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

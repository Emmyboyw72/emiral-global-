import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { ProductCard } from '../components/ProductCard';

export function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const snap = await getDocs(collection(db, 'products'));
        const fetchedProducts = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter((p: any) => p.published !== false);
        // Sort in memory to avoid index requirements
        fetchedProducts.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
        setProducts(fetchedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow text-white/60">Official Catalogue</div>
          <h1>Our Products</h1>
          <p>Browse available Emiral Global wellness products. Natural solutions for your healthy lifestyle.</p>
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
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          {!loading && products.length === 0 && (
            <div className="empty">
              No products have been published yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

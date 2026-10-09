import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingCart, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const snap = await getDoc(doc(db, 'products', id));
        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container section text-center">
        <div className="empty">
          <h2 className="text-2xl font-black mb-4 text-dark uppercase tracking-tight">Product not found</h2>
          <Link to="/products" className="btn green">Back to Catalogue</Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const money = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(val);
  };

  return (
    <div>
      <section className="py-8 border-b border-slate-100">
        <div className="container">
          <Link to="/products" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-dark transition-colors">
            <ArrowLeft size={14} /> Back to Products
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="card p-0 overflow-hidden bg-[#f4f5f4] aspect-square flex items-center justify-center">
            {(product.thumbnail || product.imageUrl) ? (
              <img src={product.thumbnail || product.imageUrl} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="text-slate-300 font-black italic text-4xl">EMIRAL</div>
            )}
          </div>

          <div>
            <span className="tag">{product.category}</span>
            <h1 className="text-4xl md:text-5xl font-black text-dark mb-4 leading-tight tracking-tight">
              {product.name}
            </h1>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
              {product.short_description}
            </p>

            <div className="price text-3xl mb-8">
              {money(product.price)}
            </div>

            <p className="muted mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="chips mb-8">
              <span className="pill">{product.availability}</span>
              <span className="pill">Stock: {product.stock_quantity}</span>
              {product.sku && <span className="pill">SKU: {product.sku}</span>}
            </div>

            <form onSubmit={handleAddToCart} className="flex gap-4 items-center">
              <input 
                type="number" 
                min="1" 
                max="99" 
                value={qty} 
                onChange={(e) => setQty(parseInt(e.target.value))}
                className="input w-24 text-center font-bold"
              />
              <button 
                type="submit" 
                disabled={added}
                className={twMerge(
                  "btn flex-grow py-4 text-[12px] flex items-center gap-2",
                  added ? "bg-emerald-100 text-emerald-700" : "green"
                )}
              >
                {added ? (
                  <><CheckCircle2 size={18} /> Added to cart</>
                ) : (
                  <><ShoppingCart size={18} /> Add to cart</>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container grid cols-3">
          <div className="card">
            <h3 className="font-black text-lg mb-4">Ingredients</h3>
            <p className="muted text-sm whitespace-pre-line">
              {product.ingredients || 'See official product packaging for full herbal ingredient list.'}
            </p>
          </div>
          <div className="card">
            <h3 className="font-black text-lg mb-4">Usage Instructions</h3>
            <p className="muted text-sm whitespace-pre-line">
              {product.usage_instructions || 'Follow the herbal dosage instructions printed on the product packaging.'}
            </p>
          </div>
          <div className="card">
            <h3 className="font-black text-lg mb-4">Product Information</h3>
            <p className="muted text-sm whitespace-pre-line">
              {product.product_information || 'For herbal extracts and remedies, consult a qualified healthcare professional if you are pregnant, breastfeeding, taking medication, or managing a medical condition.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper
import { twMerge } from 'tailwind-merge';

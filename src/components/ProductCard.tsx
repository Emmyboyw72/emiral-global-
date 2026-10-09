import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const money = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(val);
  };

  const img = product.thumbnail || product.imageUrl;

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="block">
        <div className="pic">
          {img ? (
            <img src={img} alt={product.name} referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 font-black italic">
              EMIRAL
            </div>
          )}
        </div>
        <div className="body">
          <span className="tag">{product.category}</span>
          <h3 className="font-black text-dark text-lg mb-2 group-hover:text-green transition-colors">{product.name}</h3>
          <p className="muted text-sm mb-4 line-clamp-2">{product.short_description}</p>
          <div className="mt-auto flex items-center justify-between">
            <span className="price text-xl">{money(product.price)}</span>
            <button 
              onClick={handleAddToCart}
              className="btn green px-4 py-2 text-xs"
            >
              Add to cart
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}

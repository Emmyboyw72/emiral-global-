import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export function Cart() {
  const { cart, removeFromCart, updateQty, subtotal } = useCart();

  const money = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(val);
  };

  if (cart.length === 0) {
    return (
      <div className="container section text-center">
        <div className="empty flex flex-col items-center gap-6">
          <ShoppingBag size={48} className="text-slate-200" />
          <div>
            <h2 className="text-2xl font-black text-dark mb-2">Your cart is empty</h2>
            <p className="muted">Looks like you haven't added anything to your cart yet.</p>
          </div>
          <Link to="/products" className="btn green px-8">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="text-4xl font-black text-dark mb-12">Your Shopping Bag</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="card flex flex-col sm:flex-row items-center gap-6 p-4 md:p-4">
                <div className="w-24 h-24 bg-light rounded-xl overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="font-bold text-dark">{item.name}</h3>
                  <div className="text-green font-black mt-1">{money(item.price)}</div>
                </div>

                <div className="flex items-center gap-3 bg-light rounded-xl p-1">
                  <button 
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-8 h-8 flex items-center justify-center hover:text-green transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-black text-sm">{item.qty}</span>
                  <button 
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-8 h-8 flex items-center justify-center hover:text-green transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="text-right min-w-[100px] hidden sm:block">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Total</div>
                  <div className="font-black text-dark">{money(item.price * item.qty)}</div>
                </div>

                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <aside className="card space-y-6 sticky top-24">
            <h3 className="text-xl font-black text-dark border-b border-slate-100 pb-4">Order Summary</h3>
            
            <div className="space-y-4 text-sm font-bold text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-dark">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-dark italic">Calculated at checkout</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex justify-between items-end mb-8">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total</span>
                <span className="text-3xl font-black text-dark">{money(subtotal)}</span>
              </div>

              <Link to="/checkout" className="btn green w-full py-4 text-base flex items-center gap-2">
                Checkout Now <ArrowRight size={18} />
              </Link>
              
              <Link to="/products" className="block text-center mt-6 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-dark transition-colors">
                Continue Shopping
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

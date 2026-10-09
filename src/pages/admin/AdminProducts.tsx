import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Plus, Edit, Trash2 } from 'lucide-react';

export function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const fetchedProducts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Sort in memory to avoid index requirements
      fetchedProducts.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
      
      setProducts(fetchedProducts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        fetchProducts();
      } catch (err) {
        alert('Failed to delete product.');
      }
    }
  };

  const money = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(val);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-10 bg-white rounded w-1/4"></div><div className="h-96 bg-white rounded"></div></div>;

  return (
    <div className="space-y-10">
      <div className="admin-head flex justify-between items-end">
        <div>
          <div className="eyebrow">Inventory</div>
          <h1 className="text-3xl font-black text-dark">Products</h1>
        </div>
        <Link to="/admin/products/new" className="btn green flex items-center gap-2">
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className="table-wrap rounded-xl bg-white shadow-sm border border-line">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Published</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-soft rounded-lg overflow-hidden shrink-0 border border-line">
                      {(p.thumbnail || p.imageUrl) ? (
                        <img src={p.thumbnail || p.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] font-black text-slate-300">NO IMG</div>
                      )}
                    </div>
                    <b className="text-dark">{p.name}</b>
                  </div>
                </td>
                <td><span className="tag">{p.category}</span></td>
                <td className="font-black text-dark">{money(p.price)}</td>
                <td className="text-muted font-bold">{p.stock_quantity ?? p.stock ?? 0}</td>
                <td>
                  <span className={`status ${p.published ? 'green' : 'orange'}`}>
                    {p.published ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <Link to={`/admin/products/edit/${p.id}`} className="btn outline p-2">
                      <Edit size={16} />
                    </Link>
                    <button onClick={() => handleDelete(p.id)} className="btn danger p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-20 text-muted font-bold italic">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { ImageUpload } from '../../components/ImageUpload';

export function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { register, handleSubmit, setValue, watch } = useForm<any>({
    defaultValues: {
      published: true,
      featured: false,
      category: 'WELLNESS',
      stock_quantity: 10,
      price: 0,
      availability: 'In Stock',
      name: '',
      sku: '',
      thumbnail: '',
      short_description: '',
      description: '',
      ingredients: '',
      usage_instructions: '',
      product_information: ''
    }
  });
  
  const thumbnail = watch('thumbnail');

  useEffect(() => {
    if (id) {
      setLoading(true);
      getDoc(doc(db, 'products', id))
        .then(snap => {
          if (snap.exists()) {
            const data = snap.data();
            setProduct({ id: snap.id, ...data });
            
            // Populate form values safely
            Object.keys(data).forEach(key => {
              if (data[key] !== undefined && data[key] !== null) {
                setValue(key, data[key]);
              }
            });

            // Map aliases
            const img = data.thumbnail || data.imageUrl || '';
            setValue('thumbnail', img);
            const stockVal = data.stock_quantity ?? data.stock ?? 0;
            setValue('stock_quantity', stockVal);
            const featVal = data.featured ?? data.isFeatured ?? false;
            setValue('featured', !!featVal);
          }
        })
        .catch(err => {
          console.error("Error fetching product:", err);
          setError("Failed to load product details.");
        })
        .finally(() => setLoading(false));
    }
  }, [id, setValue]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Check auth status
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You are not currently authenticated. Please log in through the Admin Portal to save products.');
      }

      if (!data.name || !data.name.trim()) {
        throw new Error('Please enter a valid product name.');
      }

      const pPrice = Number(data.price);
      const pStock = Number(data.stock_quantity);
      const pThumb = (thumbnail || data.thumbnail || data.imageUrl || '').trim();

      // Clean, well-structured payload with NO undefined or NaN values
      const payload: Record<string, any> = {
        name: data.name.trim(),
        category: (data.category || 'WELLNESS').trim(),
        price: isNaN(pPrice) ? 0 : pPrice,
        stock_quantity: isNaN(pStock) ? 0 : pStock,
        stock: isNaN(pStock) ? 0 : pStock, // dual compatibility
        sku: (data.sku || `EM-${Date.now().toString().slice(-4)}`).trim(),
        availability: (data.availability || (pStock > 0 ? 'In Stock' : 'Out of Stock')).trim(),
        thumbnail: pThumb,
        imageUrl: pThumb, // dual compatibility
        short_description: (data.short_description || '').trim(),
        description: (data.description || '').trim(),
        ingredients: (data.ingredients || '').trim(),
        usage_instructions: (data.usage_instructions || '').trim(),
        product_information: (data.product_information || '').trim(),
        published: !!data.published,
        featured: !!data.featured,
        isFeatured: !!data.featured, // dual compatibility
        currency: '₦',
        updated_at: serverTimestamp()
      };

      if (id) {
        await updateDoc(doc(db, 'products', id), payload);
        setSuccess('Product updated successfully!');
      } else {
        payload.created_at = serverTimestamp();
        await addDoc(collection(db, 'products'), payload);
        setSuccess('Product created and saved successfully!');
      }

      setTimeout(() => {
        navigate('/admin/products');
      }, 1000);
    } catch (err: any) {
      console.error('Save product error:', err);
      const msg = err?.message || 'Failed to save product.';
      if (msg.toLowerCase().includes('permission') || err?.code === 'permission-denied') {
        setError('Permission Denied: Your account does not have write access in Firestore. Please ensure you signed in with an authorized admin email.');
      } else {
        setError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading && id) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="admin-head flex justify-between items-end">
        <div>
          <div className="eyebrow">Inventory</div>
          <h1 className="text-3xl font-black text-dark">{id ? 'Edit' : 'New'} Product</h1>
        </div>
        <Link to="/admin/products" className="btn outline flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Products
        </Link>
      </div>

      {/* Admin Auth Status indicator */}
      {auth.currentUser && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>Signed in as Admin: <b>{auth.currentUser.email}</b></span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-5 py-4 rounded-xl text-xs font-bold flex items-start gap-3 shadow-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-grow">
            <b className="block mb-1">Save Error:</b>
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-xl text-xs font-bold flex items-center gap-3 shadow-sm">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          <span>{success} Redirecting to products list...</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                Product Name *
              </label>
              <input 
                {...register('name', { required: true })} 
                className="input" 
                placeholder="e.g. Emiral Herbal Tonic" 
              />
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                Category
              </label>
              <select {...register('category')} className="input">
                {['WELLNESS', 'HERBAL', 'PERSONAL CARE', 'TEA & BEVERAGES', 'GENERAL'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                  SKU
                </label>
                <input {...register('sku')} className="input" placeholder="EM-1001" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                  Stock Quantity
                </label>
                <input type="number" {...register('stock_quantity')} className="input" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                  Price (₦) *
                </label>
                <input type="number" step="0.01" {...register('price', { required: true })} className="input" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                  Availability
                </label>
                <input {...register('availability')} className="input" placeholder="In Stock" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <ImageUpload 
              label="Product Image (ImageKit)"
              currentImage={thumbnail}
              onUploadSuccess={(url) => {
                setValue('thumbnail', url, { shouldDirty: true, shouldValidate: true });
              }}
              onRemove={() => {
                setValue('thumbnail', '', { shouldDirty: true, shouldValidate: true });
              }}
              folder="products"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
              Short Description
            </label>
            <textarea 
              {...register('short_description')} 
              className="input" 
              placeholder="Brief summary displayed on product cards..." 
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
              Full Description
            </label>
            <textarea 
              {...register('description')} 
              className="input h-36" 
              placeholder="Comprehensive product benefits and description..." 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
              Ingredients
            </label>
            <textarea 
              {...register('ingredients')} 
              className="input h-28 text-xs" 
              placeholder="e.g. Pure moringa extract, ginger, turmeric..." 
            />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
              Usage Instructions
            </label>
            <textarea 
              {...register('usage_instructions')} 
              className="input h-28 text-xs" 
              placeholder="e.g. Take 1 capsule twice daily with meals..." 
            />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
              Product Information
            </label>
            <textarea 
              {...register('product_information')} 
              className="input h-28 text-xs" 
              placeholder="Storage conditions, batch details, certifications..." 
            />
          </div>
        </div>

        <div className="chips border-t border-line pt-6 flex gap-6">
          <label className="pill flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" {...register('featured')} className="w-4 h-4 accent-green" />
            <span>Featured on Homepage</span>
          </label>
          <label className="pill flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" {...register('published')} className="w-4 h-4 accent-green" />
            <span>Published / Visible in Store</span>
          </label>
        </div>

        <div className="pt-6 border-t border-line flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="btn green px-12 py-4 text-base flex items-center gap-3 shadow-lg shadow-green/20"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Saving to Database...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

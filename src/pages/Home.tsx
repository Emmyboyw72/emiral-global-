import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ChevronRight, Play, Users, Target, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../lib/useSettings';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

export function Home() {
  const { settings, loading: settingsLoading } = useSettings();
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const snap = await getDocs(collection(db, 'products'));
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const featured = all.filter((p: any) => (p.featured === true || p.isFeatured === true) && p.published !== false);
        setProducts(featured.length > 0 ? featured.slice(0, 4) : all.filter((p: any) => p.published !== false).slice(0, 4));
      } catch (err) {
        console.error("Home products error:", err);
      } finally {
        setProductsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (settingsLoading || productsLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
    </div>
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="hero bg-[#f4faf7] min-h-[85vh] flex items-center relative overflow-hidden">
        {/* Floating Diamond Shape */}
        <div className="absolute top-[10%] right-[10%] w-[30vw] h-[30vw] bg-[#14532d]/5 rotate-45 pointer-events-none hidden lg:block"></div>
        
        <div className="container py-16 px-6 relative z-10 flex flex-col">
          <div className="hero-copy max-w-2xl bg-transparent py-0 px-0 flex flex-col items-start text-left">
            <div className="eyebrow text-[#15803d] font-black tracking-[0.2em] mb-6 uppercase">EMIRAL 🌿 HERBS • EST. NIGERIA</div>
            <h1 className="text-[#14532d] font-black text-[clamp(44px,10vw,90px)] leading-[0.85] tracking-tighter mb-8 uppercase whitespace-pre-line">
              {settings.heroTitle?.replace(/\\n/g, '\n') || "NATURALWELL\nNESS.ROOTED\nINPURPOSE."}
            </h1>
            <p className="text-lg md:text-xl text-[#14532d]/70 font-bold mb-10 leading-relaxed">
              {settings.heroSubtitle || "Emiral Global is committed to promoting natural wellness through carefully developed herbal and natural health products designed to support healthier lifestyles."}
            </p>
            <div className="flex flex-col gap-4 w-full sm:max-w-md">
              <Link to="/products" className="bg-[#14532d] text-white px-12 py-5 text-sm font-black uppercase tracking-widest hover:bg-[#1a6638] transition-all shadow-xl shadow-[#14532d]/20 text-center rounded-lg">SHOP PRODUCTS</Link>
              <Link to="/about" className="bg-white border-2 border-[#14532d] text-[#14532d] px-12 py-5 text-sm font-black uppercase tracking-widest hover:bg-[#f8faf8] transition-all text-center rounded-lg">OUR STORY</Link>
            </div>
          </div>
          
          <div className="hero-media-standalone mt-16 relative w-full max-w-4xl mx-auto">
            <div className="aspect-video bg-[#eef1ee] overflow-hidden shadow-[0_40px_80px_-15px_rgba(20,83,45,0.2)] rounded-3xl">
              <img 
                src={settings.heroImage || "/assets/images/hero_wellness_natural_1791107474208.jpg"} 
                alt="Natural Wellness" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Body Images & Video Ads Section */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1">
              <div className="card p-0 overflow-hidden rounded-3xl aspect-[4/3] shadow-2xl">
                <img src={settings.bodyImage1 || "/assets/images/hero_wellness_natural_1791107474208.jpg"} alt="Welcome" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <div className="eyebrow">Welcome to Emiral</div>
              <h2 className="text-4xl font-black text-dark leading-tight tracking-tight uppercase">
                {settings.welcomeTitle || "We bring the best of nature to your doorstep."}
              </h2>
              <p className="text-muted leading-relaxed text-lg font-bold">
                {settings.welcomeText || "Our mission is to empower individuals through holistic health education and premium natural products that actually work."}
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 font-bold text-dark"><CheckCircle2 className="text-green" size={20} /> 100% Organic Ingredients</li>
                <li className="flex items-center gap-3 font-bold text-dark"><CheckCircle2 className="text-green" size={20} /> Locally Sourced & Manufactured</li>
                <li className="flex items-center gap-3 font-bold text-dark"><CheckCircle2 className="text-green" size={20} /> Community Support Network</li>
              </ul>
            </div>
          </div>

          {settings.adVideoUrl && (
            <div className="card bg-dark p-0 overflow-hidden rounded-3xl shadow-2xl mb-20 group relative">
              <video 
                src={settings.adVideoUrl} 
                className="w-full aspect-video object-cover opacity-60"
                autoPlay
                muted
                loop
                playsInline
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-green rounded-full flex items-center justify-center text-white mb-6 animate-pulse shadow-xl shadow-green/50">
                  <Play size={32} fill="currentColor" />
                </div>
                <h3 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Experience Natural Living</h3>
                <p className="text-white/60 max-w-xl mx-auto font-bold uppercase tracking-widest text-[10px]">Watch our community grow through natural wellness and entrepreneurship.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="eyebrow">Our Community</div>
              <h2 className="text-4xl font-black text-dark leading-tight tracking-tight uppercase">
                {settings.communityTitle || "A network built on trust and shared success."}
              </h2>
              <p className="text-muted leading-relaxed text-lg font-bold">
                {settings.communityText || "At Emiral Global, we believe in the power of community. Join thousands of Nigerians who have transformed their lives through our wellness and business programs."}
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <div className="text-3xl font-black text-green">10k+</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Community Members</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-black text-green">50+</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Wellness Seminars</div>
                </div>
              </div>
            </div>
            <div>
              <div className="card p-0 overflow-hidden rounded-3xl aspect-[4/3] shadow-2xl">
                <img src={settings.bodyImage2 || "/assets/images/hero_wellness_natural_1791107474208.jpg"} alt="Community" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section bg-soft">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="eyebrow">Featured Collection</div>
              <h2 className="text-3xl md:text-4xl font-black text-dark tracking-tight">Natural wellness for everyday living</h2>
            </div>
            <p className="muted max-w-sm text-sm">Explore the current Emiral Global product catalogue. Quality assured wellness products.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
            {products.length === 0 && (
               <div className="col-span-full py-20 text-center muted font-bold italic border-2 border-dashed border-slate-200 rounded-3xl">
                  No featured products yet. Add some in the admin panel!
               </div>
            )}
          </div>
          
          <div className="mt-16 text-center">
             <Link to="/products" className="bg-white border-2 border-[#14532d] text-[#14532d] px-12 py-5 text-sm font-black uppercase tracking-widest hover:bg-[#14532d] hover:text-white transition-all text-center rounded-lg inline-block">
                More Products
             </Link>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section">
        <div className="container grid cols-3">
          <div className="card">
            <div className="eyebrow">01 • Nature</div>
            <h3 className="text-xl font-black mb-4 uppercase tracking-tight text-dark">Natural focus</h3>
            <p className="muted text-sm leading-relaxed">Wellness products presented with clear product information and usage guidance.</p>
          </div>
          <div className="card">
            <div className="eyebrow">02 • Community</div>
            <h3 className="text-xl font-black mb-4 uppercase tracking-tight text-dark">People first</h3>
            <p className="muted text-sm leading-relaxed">Education, events and support designed around the Emiral community.</p>
          </div>
          <div className="card">
            <div className="eyebrow">03 • Purpose</div>
            <h3 className="text-xl font-black mb-4 uppercase tracking-tight text-dark">Business opportunity</h3>
            <p className="muted text-sm leading-relaxed">Learn about the business and distribution opportunities available through Emiral Global.</p>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="section soft">
        <div className="container">
          <div className="text-center mb-16">
            <div className="eyebrow">Frequently Asked</div>
            <h2 className="text-3xl md:text-4xl font-black text-dark tracking-tight">Questions from our community</h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <details className="faq" open>
              <summary>How can I become an Emiral Global distributor?</summary>
              <p>You can start by contacting us through our contact page or by attending one of our community seminars. We provide full training and support for all our partners.</p>
            </details>
            <details className="faq">
              <summary>Are your products available outside Nigeria?</summary>
              <p>Currently, we focus on serving the Nigerian market, but we are expanding to other African countries soon. Check our "Community" page for updates on regional launches.</p>
            </details>
            <details className="faq">
              <summary>How do I track my order?</summary>
              <p>Once you place an order, you will receive an order number. Use this number on our "Track Order" page to see the status of your payment and delivery.</p>
            </details>
            
            <div className="mt-12 text-center">
              <Link to="/faq" className="btn outline">See all FAQs</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

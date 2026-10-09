import { Link } from 'react-router-dom';
import { useSettings } from '../lib/useSettings';

export function Opportunity() {
  const { settings } = useSettings();

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow text-white/60">Grow With Us</div>
          <h1>{settings.oppTitle || "Herbal Distribution Opportunity"}</h1>
          <p>{settings.oppSubtitle || "Learn about distribution, community building and business opportunities connected to Emiral Global Herbs."}</p>
        </div>
      </section>

      <section className="section">
        <div className="container grid cols-3">
          <div className="card">
            <div className="eyebrow">01</div>
            <h3 className="text-xl font-black mb-4 uppercase tracking-tight text-green">Learn the Herbs</h3>
            <p className="muted mb-6 text-sm leading-relaxed">Understand the science and tradition behind our herbs, pricing and responsible communication. We value herbal integrity above all else.</p>
          </div>
          <div className="card">
            <div className="eyebrow">02</div>
            <h3 className="text-xl font-black mb-4 uppercase tracking-tight text-green">Build Community</h3>
            <p className="muted mb-6 text-sm leading-relaxed">Connect customers to herbal wisdom, support and events. Growing a healthier community together is our core philosophy.</p>
          </div>
          <div className="card border-green">
            <div className="eyebrow">03</div>
            <h3 className="text-xl font-black mb-4 text-green uppercase tracking-tight">Partner with Emiral</h3>
            <p className="muted mb-6 text-sm leading-relaxed">Ask about current herbal distributor requirements, availability and official onboarding process.</p>
            <Link to="/contact" className="btn green w-full">Contact us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

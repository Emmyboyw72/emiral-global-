import { Link } from 'react-router-dom';
import { useSettings } from '../lib/useSettings';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { settings } = useSettings();

  return (
    <>
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Link to="/" className="brand">
                <span className="brand-mark" style={{ background: 'white', color: 'var(--green)' }}>🌿</span>
                <span>
                  <b className="text-white font-black uppercase tracking-tight text-xl leading-none">EMIRAL</b>
                  <small className="text-green font-black tracking-[0.2em] -mt-1 uppercase">GLOBAL</small>
                </span>
              </Link>
              <p className="mt-4 text-[#cbd5d1] text-[13px] font-bold">
                {settings.footerDescription || "Natural Health • Herbal Wellness. Emiral Global supports holistic wellness through natural herbal solutions, education and community."}
              </p>
            </div>

            <div>
              <h4>Company</h4>
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/products">Products</Link></li>
                <li><Link to="/wellness">Wellness Education</Link></li>
                <li><Link to="/community">Community Events</Link></li>
                <li><Link to="/opportunity">Business Opportunity</Link></li>
              </ul>
            </div>

            <div>
              <h4>Resources</h4>
              <ul>
                <li><Link to="/track-order">Track Order</Link></li>
                <li><Link to="/blog">Latest Blog</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/contact">Contact Support</Link></li>
                <li className="mt-4"><Link to="/admin/login" className="btn outline py-2 px-4 text-[10px]">Admin Access</Link></li>
              </ul>
            </div>

            <div>
              <h4>Contact</h4>
              <p>{settings.contactAddress || "101 Allen Avenue, Ikeja, Lagos"}</p>
              <p>{settings.contactPhone || "07083912427"}</p>
              <p>{settings.contactEmail || "emiralglobal@gmail.com"}</p>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {currentYear} Emiral Global. All rights reserved.</span>
            <span>Nigeria's natural wellness community.</span>
          </div>
        </div>
      </footer>
      <a 
        className="whatsapp" 
        target="_blank" 
        rel="noopener noreferrer" 
        href={`https://wa.me/${settings.socialWhatsapp || "2347083912427"}`}
      >
        ✆
      </a>
    </>
  );
}

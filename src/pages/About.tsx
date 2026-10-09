import { useSettings } from '../lib/useSettings';

export function About() {
  const { settings } = useSettings();

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow text-white/60">Our Story</div>
          <h1>{settings.aboutTitle || "About Emiral Global"}</h1>
          <p>{settings.aboutSubtitle || "A herb-focused organization built around natural healing, education, community support and opportunity."}</p>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-dark leading-tight mb-8 text-green whitespace-pre-line">
              {settings.heroTitle?.replace(/\\n/g, '\n') || "Natural Wellness.\nRooted in Purpose."}
            </h2>
            <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
              <p>
                Emiral Global is a leading natural health organization specializing in the study and distribution of potent herbal remedies that restore balance and vitality.
              </p>
              <p>
                Our goal is to make the power of herbs accessible to everyone, providing clear guidance on traditional wisdom backed by modern quality standards.
              </p>
            </div>
          </div>
          <div className="grid gap-8">
            <div className="card">
              <div className="eyebrow">Mission</div>
              <h3 className="text-xl font-black mb-4">Restore Vitality through Herbs</h3>
              <p className="muted">{settings.aboutMission || "Provide premium natural herbal products and education with transparent usage information."}</p>
            </div>
            <div className="card">
              <div className="eyebrow">Vision</div>
              <h3 className="text-xl font-black mb-4">A World Healed by Nature</h3>
              <p className="muted">{settings.aboutVision || "Create a strong network of herbal enthusiasts, distributors and wellness advocates."}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

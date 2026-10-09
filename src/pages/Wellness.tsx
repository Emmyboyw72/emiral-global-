import { useSettings } from '../lib/useSettings';

export function Wellness() {
  const { settings } = useSettings();

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow text-white/60">Education</div>
          <h1>{settings.wellnessTitle || "Herbal Wisdom"}</h1>
          <p>{settings.wellnessSubtitle || "Practical guidance for informed decisions on using natural herbs and building healthy living habits."}</p>
        </div>
      </section>

      <section className="section">
        <div className="container grid cols-3">
          <div className="card border-green/20">
            <h3 className="text-xl font-black mb-4 text-green">Understand the Herb</h3>
            <p className="muted">Always review ingredients, directions, warnings and storage instructions provided with a product. Understanding the profile of the herb you consume is vital.</p>
          </div>
          <div className="card border-green/20">
            <h3 className="text-xl font-black mb-4 text-green">Consult Professionals</h3>
            <p className="muted">If you take medication, are pregnant or breastfeeding, or manage a health condition, ask a qualified healthcare professional before using herbal extracts.</p>
          </div>
          <div className="card border-green/20">
            <h3 className="text-xl font-black mb-4 text-green">Supportive Care</h3>
            <p className="muted">Natural herbs are powerful tools to support your body's innate healing ability. They are designed to complement a healthy lifestyle and provide sustainable wellness.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

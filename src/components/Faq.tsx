import { useState } from "react";
import { faqItems, faqStatement } from "../data/faq";

// CSS grid-template-rows accordion technique: animates 0fr -> 1fr instead of
// measuring/animating height in JS — no layout thrash, no max-height hack.
export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="faq section-light section-pad" data-theme-section="light">
      <div className="wrap faq-inner">
        <div className="faq-head">
          <p className="eyebrow">
            <span className="dot" /> Design Approach
          </p>
          <h2 className="statement faq-statement" data-fade>
            “{faqStatement.prefix}
            <span className="faq-statement-script">{faqStatement.accent}</span>
            {faqStatement.suffix}”
          </h2>
        </div>
        <div className="faq-list">
          {faqItems.map((item, i) => (
            <div className={`faq-item${openIndex === i ? " is-open" : ""}`} key={item.question}>
              <button
                className="faq-q"
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span>{item.question}</span>
                <span className="faq-icon" aria-hidden="true" />
              </button>
              <div className="faq-a">
                <div className="faq-a-inner">
                  {item.answer.map((paragraph, pi) => (
                    <p key={pi}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

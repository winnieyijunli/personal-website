import FooterWordmark from "./FooterWordmark";
import FooterGradientBlob from "./FooterGradientBlob";
import FooterContactForm from "./FooterContactForm";
import { footerContact, footerStatement } from "../data/footer";

// Reproduces the teardown's footer-wrap-dark "peel reveal": a solid panel
// covers the footer until scroll pulls it away (see useScrollAnimations —
// unchanged by the layout below, since it targets .footer as a whole,
// not anything inside it).
//
// FooterGradientBlob is a direct child of <footer> (not nested inside
// .footer-visual-col) so it's positioned/sized relative to the whole
// section, not a half-width content column — that narrower box is what
// was clipping it before.
export default function Footer() {
  return (
    <footer id="contact" className="footer" data-theme-section="light">
      <div className="footer-curtain" data-footer-curtain aria-hidden="true" />
      <FooterGradientBlob />

      <div className="wrap footer-grid">
        <div className="footer-form-col">
          <p className="eyebrow">
            <span className="dot" /> {footerStatement.eyebrow}
          </p>
          <FooterContactForm />
        </div>

        <div className="footer-visual-col">
          <h2 className="footer-statement" data-fade>
            {footerStatement.heading.split("\n").map((line, i, lines) => (
              <span key={i}>
                {line}
                {i < lines.length - 1 && <br />}
              </span>
            ))}
          </h2>
          <div className="footer-contact-links">
            <a
              className="footer-icon-link"
              href={`mailto:${footerContact.email}`}
              aria-label={`Email ${footerContact.email}`}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M4 7l8 6 8-6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              className="footer-icon-link"
              href={footerContact.linkedin}
              target="_blank"
              rel="noopener"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M8 10.5V16M8 7.5v.01M12 16v-3.8c0-1.16.95-2.1 2.1-2.1s2.1.94 2.1 2.1V16"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="wrap">
        <FooterWordmark />
      </div>
    </footer>
  );
}

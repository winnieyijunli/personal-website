// UI only — no submission wired up yet. Swap the onSubmit body for a
// real request (or a mailto/form-service call) once one exists; the
// markup/validation structure is meant to stay as-is when that happens.
export default function FooterContactForm() {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <form className="footer-form" onSubmit={handleSubmit}>
      <div className="footer-form-field">
        <label htmlFor="footer-name">Name</label>
        <input id="footer-name" name="name" type="text" autoComplete="name" required />
      </div>
      <div className="footer-form-field">
        <label htmlFor="footer-email">Email</label>
        <input id="footer-email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="footer-form-field">
        <label htmlFor="footer-message">Message</label>
        <textarea id="footer-message" name="message" rows={4} required />
      </div>
      <button type="submit" className="footer-form-submit">
        Send message
      </button>
    </form>
  );
}

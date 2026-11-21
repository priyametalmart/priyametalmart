'use client';
import { settings } from '@/lib/data';

// A static site cannot send email itself, so the form opens WhatsApp (or the visitor's email app)
// with the message already filled in.
export default function ContactForm() {
  const wa = settings.whatsapp?.replace(/\D/g, '');
  const email = settings.email;
  if (!wa && !email) return null;

  const send = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const text = `Name: ${f.get('name')}\nPhone: ${f.get('phone') || '-'}\n\n${f.get('message')}`;
    window.location.href = wa
      ? `https://wa.me/${wa}?text=${encodeURIComponent(text)}`
      : `mailto:${email}?subject=${encodeURIComponent('Website enquiry')}&body=${encodeURIComponent(text)}`;
  };

  return (
    <form className="form" onSubmit={send}>
      <div><input name="name" required placeholder="Name" aria-label="Name" /><input name="phone" type="tel" placeholder="Phone number" aria-label="Phone number" /></div>
      <textarea name="message" rows="6" required placeholder="Message" aria-label="Message" />
      <button className="btn">{wa ? 'Send on WhatsApp' : 'Send by email'}</button>
    </form>
  );
}

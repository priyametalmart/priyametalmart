'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  if (sent) return <p>Thanks for contacting us. We will get back to you soon.</p>;
  return (
    <form className="form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
      <div><input required placeholder="Name" aria-label="Name" /><input required type="email" placeholder="Email" aria-label="Email" /></div>
      <input placeholder="Phone number" aria-label="Phone number" />
      <textarea rows="6" required placeholder="Comment" aria-label="Comment" />
      <button className="btn">Send message</button>
    </form>
  );
}

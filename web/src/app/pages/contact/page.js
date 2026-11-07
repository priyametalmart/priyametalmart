import ContactForm from './ContactForm';
import { BRAND, EMAIL, PHONE } from '@/lib/data';

export const metadata = { title: 'Contact Us' };

export default function Contact() {
  return (
    <div className="shell page reading">
      <h1>Contact Us</h1>
      <p>Send us a message and we will reply as soon as we can. You can also reach us on WhatsApp.</p>
      <p>WhatsApp: {PHONE}<br />Email: {EMAIL}</p>
      <p><b>Location</b><br />{BRAND}, [shop address]</p>
      <ContactForm />
    </div>
  );
}

import ContactForm from './ContactForm';
import { BRAND, settings } from '@/lib/data';

export const metadata = { title: 'Contact Us' };

export default function Contact() {
  const { whatsapp, phone, email, address } = settings;
  return (
    <div className="shell page reading">
      <h1>Contact Us</h1>
      <p>Send us a message and we will reply as soon as we can.</p>
      {(whatsapp || phone || email) && (
        <p>
          {whatsapp && <>WhatsApp: <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}>{whatsapp}</a><br /></>}
          {phone && <>Phone: <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a><br /></>}
          {email && <>Email: <a href={`mailto:${email}`}>{email}</a></>}
        </p>
      )}
      {address && <p><b>Location</b><br />{BRAND}, {address}</p>}
      <ContactForm />
    </div>
  );
}

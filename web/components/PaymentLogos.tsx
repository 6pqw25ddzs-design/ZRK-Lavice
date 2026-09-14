// Zvanični logoi kartičnih šema i procesora — obavezni elementi web prodajnog mjesta.
const LOGOS = [
  { src: '/platne/visa.jpg', alt: 'Visa', href: 'https://www.visa.com' },
  { src: '/platne/mastercard.png', alt: 'Mastercard', href: 'https://www.mastercard.com' },
  { src: '/platne/maestro.png', alt: 'Maestro', href: 'https://www.mastercard.com' },
  { src: '/platne/visa-secure.jpg', alt: 'Visa Secure', href: 'https://www.visa.com/pay-with-visa/featured-technologies/visa-secure.html' },
  { src: '/platne/mc-idcheck.png', alt: 'Mastercard Identity Check', href: 'https://www.mastercard.com' },
  { src: '/platne/monri.png', alt: 'Monri WebPay', href: 'https://monri.com' },
  { src: '/platne/ckb-otp.jpg', alt: 'CKB — OTP banka', href: 'https://www.ckb.me' },
];

export default function PaymentLogos() {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      {LOGOS.map(l => (
        <a key={l.alt} href={l.href} target="_blank" rel="noopener noreferrer" title={l.alt}
          className="bg-white rounded-lg px-3 h-12 flex items-center hover:opacity-85 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={l.src} alt={l.alt} className="h-7 w-auto object-contain" style={{ maxWidth: 90 }} />
        </a>
      ))}
    </div>
  );
}

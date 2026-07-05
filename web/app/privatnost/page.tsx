export const metadata = { title: 'Politika privatnosti — ŽRK Lavice' };

export default function PrivatnostPage() {
  const sekcija = "text-white font-black text-xl mt-8 mb-3";
  const tekst = "leading-relaxed";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12" style={{ color: 'var(--text-muted)' }}>
      <h1 className="text-3xl font-black text-white mb-2">Politika privatnosti</h1>
      <p className="text-sm">Posljednje ažuriranje: 27. jun 2026.</p>

      <p className={`${tekst} mt-6`}>
        Ženski rukometni klub Lavice („ŽRK Lavice", „mi") poštuje vašu privatnost. Ova politika
        objašnjava koje podatke prikupljamo putem naše web stranice (zrklavice.me) i mobilne
        aplikacije, kako ih koristimo i koja su vaša prava.
      </p>

      <h2 className={sekcija}>Koje podatke prikupljamo</h2>
      <p className={tekst}>
        Podatke prikupljamo isključivo kada ih dobrovoljno unesete, prvenstveno kroz formu za
        upis djeteta:
      </p>
      <ul className="list-disc pl-6 mt-3 space-y-1">
        <li>Ime i prezime djeteta</li>
        <li>Godište djeteta</li>
        <li>Ime i prezime roditelja/staratelja</li>
        <li>Kontakt telefon roditelja/staratelja</li>
        <li>Email adresa roditelja/staratelja</li>
      </ul>
      <p className={`${tekst} mt-3`}>
        Aplikacija ne prikuplja podatke o lokaciji, ne koristi reklamne identifikatore i ne
        prati vašu aktivnost van kluba.
      </p>

      <h2 className={sekcija}>Kako koristimo podatke</h2>
      <p className={tekst}>
        Unesene podatke koristimo isključivo da bismo obradili prijavu za upis i kontaktirali
        roditelja/staratelja u vezi sa članstvom djeteta u klubu. Podatke ne prodajemo i ne
        dijelimo sa trećim stranama u marketinške svrhe.
      </p>

      <h2 className={sekcija}>Podaci o djeci</h2>
      <p className={tekst}>
        Formu za upis popunjava roditelj ili staratelj, čime daje saglasnost za obradu podataka
        djeteta u svrhu upisa. Podatke o djeci koristimo samo u okviru aktivnosti kluba.
      </p>

      <h2 className={sekcija}>Čuvanje i sigurnost</h2>
      <p className={tekst}>
        Podaci se čuvaju na zaštićenim serverima i dostupni su samo ovlašćenim predstavnicima
        kluba. Čuvamo ih onoliko koliko je potrebno za svrhu upisa i vođenje evidencije članstva.
      </p>

      <h2 className={sekcija}>Vaša prava</h2>
      <p className={tekst}>
        U svakom trenutku možete zatražiti uvid, ispravku ili brisanje podataka koje ste nam
        dostavili. Zahtjev pošaljite na email naveden ispod i postupićemo u razumnom roku.
      </p>

      <h2 className={sekcija}>Kontakt</h2>
      <p className={tekst}>
        Za sva pitanja u vezi sa privatnošću kontaktirajte nas na{' '}
        <a href="mailto:info@zrklavice.me" style={{ color: 'var(--primary)' }} className="hover:underline">info@zrklavice.me</a>.
      </p>
    </div>
  );
}

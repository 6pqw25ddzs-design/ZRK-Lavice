export const metadata = { title: 'Politika privatnosti — ŽRK Lavice' };

export default function PrivatnostPage() {
  const sekcija = "text-white font-black text-xl mt-8 mb-3";
  const tekst = "leading-relaxed";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12" style={{ color: 'var(--text-muted)' }}>
      <h1 className="text-3xl font-black text-white mb-2">Politika privatnosti</h1>
      <p className="text-sm">Posljednje ažuriranje: 11. septembar 2026.</p>

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

      <h2 className={sekcija}>Podaci kod online plaćanja</h2>
      <p className={tekst}>
        Kod online donacija i članarina prikupljamo ime, email i iznos uplate — radi evidencije
        uplate i slanja potvrde. Plaćanje se obavlja preko Monri WebPay sistema u saradnji sa
        Crnogorskom komercijalnom bankom: podaci o platnoj kartici unose se isključivo na
        zaštićenoj stranici procesora plaćanja i nikada ne dolaze u dodir sa serverima kluba,
        niti ih klub čuva. Podatke o uplati dijelimo samo sa procesorom plaćanja i bankom,
        u mjeri neophodnoj za izvršenje i evidenciju transakcije.
      </p>

      <h2 className={sekcija}>Sigurnost plaćanja kreditnim karticama</h2>
      <p className={tekst}>
        Tajnost Vaših podataka je zaštićena i osigurana korištenjem posljednje verzije TLS enkripcije.
        Stranice za naplatu putem interneta osigurane su korištenjem Secure Socket Layer (SSL) protokola
        sa 128-bitnom enkripcijom podataka. SSL enkripcija je postupak šifriranja podataka radi
        sprječavanja neovlaštenog pristupa prilikom njihovog prijenosa. Time je omogućen siguran prijenos
        informacija te onemogućen nedozvoljen pristup podacima prilikom komunikacije između korisnikovog
        računala i WebPay servisa, te obratno.
      </p>
      <p className={tekst}>
        WebPay servis i finansijske ustanove razmjenjuju podatke upotrebom virtualne privatne mreže (VPN),
        koja je zaštićena od neautorizovanog pristupa. Monri Payment Gateway je certificiran prema
        PCI DSS Level 1 sigurnosnom standardu propisanom Visa i Mastercard pravilima.
        Trgovac ne pohranjuje brojeve kreditnih kartica i brojevi nisu dostupni neovlaštenim osobama.
      </p>

      <h2 className={sekcija}>Izjava o zaštiti i prikupljanju ličnih podataka</h2>
      <p className={tekst}>
        Obavezujemo se pružati zaštitu ličnim podacima kupaca, na način da prikupljamo samo nužne,
        osnovne podatke o kupcima / korisnicima koji su nužni za ispunjenje naših obaveza; informišemo
        kupce o načinu korištenja prikupljenih podataka, redovno dajemo kupcima mogućnost izbora o
        upotrebi njihovih podataka, uključujući mogućnost odluke žele li ili ne da se njihovo ime ukloni
        s lista koje se koriste za marketinške kampanje.
      </p>
      <p className={tekst}>
        Svi se podaci o korisnicima strogo čuvaju i dostupni su samo djelatnicima kojima su ti podaci
        nužni za obavljanje posla. Svi naši djelatnici i poslovni partneri odgovorni su za poštovanje
        načela zaštite privatnosti.
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

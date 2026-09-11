export const metadata = { title: 'Uslovi korišćenja — ŽRK Lavice-UDG' };

const S = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-xl font-black text-white mb-3">{title}</h2>
    <div style={{ color: 'var(--text-muted)' }} className="leading-relaxed text-[15px] flex flex-col gap-3">{children}</div>
  </section>
);

export default function UsloviPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black text-white mb-10">Uslovi korišćenja i plaćanja</h1>

      <S title="Podaci o organizaciji">
        <p>
          Ženski rukometni klub „Lavice" Podgorica (ŽRK Lavice-UDG)<br />
          Trg Božane Vučinić 34, 81000 Podgorica, Crna Gora<br />
          Matični broj / PIB: 11114857<br />
          Žiro račun: 510000000023249776 (Crnogorska komercijalna banka)<br />
          Email: info@zrklavice.me · Telefon: +382 67 909 090
        </p>
      </S>

      <S title="Predmet uplata">
        <p>
          Preko sajta zrklavice.me moguće je uplatiti donaciju klubu ili članarinu.
          Uplate su dobrovoljne i koriste se isključivo za rad kluba: opremu, zakup dvorana,
          putne troškove, takmičenja i razvoj mladih rukometašica.
        </p>
        <p>
          Donacija ne predstavlja kupovinu robe ni usluge i za nju se ne isporučuje fizički proizvod.
          Članarina obezbjeđuje status člana kluba u tekućem periodu.
        </p>
      </S>

      <S title="Plaćanje karticama">
        <p>
          Online plaćanja se obavljaju preko Monri WebPay sistema u saradnji sa Crnogorskom
          komercijalnom bankom (CKB). Podaci o kartici unose se isključivo na zaštićenoj stranici
          procesora plaćanja i ne dolaze u dodir sa serverima kluba. Prihvatamo Visa i Mastercard kartice.
          Sve transakcije se izvršavaju u eurima (EUR).
        </p>
      </S>

      <S title="Politika refundacije">
        <p>
          Ako je uplata izvršena greškom (pogrešan iznos, dupla uplata, tehnička greška),
          uplatilac može zatražiti povraćaj sredstava pisanim putem na info@zrklavice.me
          u roku od 14 dana od uplate, uz broj transakcije i podatke o kartici kojom je plaćeno.
        </p>
        <p>
          Osnovane zahtjeve klub odobrava u roku od 7 radnih dana, a povraćaj se vrši
          isključivo na karticu kojom je uplata izvršena, u skladu sa procedurama banke.
        </p>
      </S>

      <S title="Zaštita podataka">
        <p>
          Klub prikuplja samo podatke neophodne za evidenciju uplate (ime, email, iznos).
          Podaci se ne dijele sa trećim licima osim procesora plaćanja i banke, u mjeri
          neophodnoj za izvršenje transakcije. Više u našoj{' '}
          <a href="/privatnost" className="underline">Politici privatnosti</a>.
        </p>
      </S>

      <S title="Kontakt i prigovori">
        <p>
          Za sva pitanja, prigovore i zahtjeve: info@zrklavice.me ili +382 67 909 090.
          Na prigovore odgovaramo u roku od 48h radnim danima.
        </p>
      </S>
    </div>
  );
}

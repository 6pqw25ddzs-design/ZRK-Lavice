import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brisanje naloga — ŽRK Lavice-UDG",
  description: "Kako zatražiti brisanje naloga i podataka u aplikaciji ZRK Lavice.",
};

export default function BrisanjeNalogaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black uppercase mb-6" style={{ fontFamily: "var(--font-display)" }}>
        Brisanje naloga
      </h1>
      <div className="space-y-4 leading-relaxed" style={{ color: "var(--foreground)" }}>
        <p>
          Ova stranica se odnosi na naloge u mobilnoj aplikaciji <strong>ZRK Lavice</strong> (ŽRK
          Lavice-UDG Podgorica).
        </p>
        <h2 className="text-xl font-bold mt-8 mb-2">Kako zatražiti brisanje naloga</h2>
        <p>
          Pošaljite zahtjev na{" "}
          <a href="mailto:digital@zrklavice.me" className="underline">
            digital@zrklavice.me
          </a>{" "}
          sa email adrese kojom ste registrovani, sa naznakom „Brisanje naloga". Nalog i povezani
          podaci biće obrisani u roku od 30 dana, o čemu ćete dobiti potvrdu.
        </p>
        <h2 className="text-xl font-bold mt-8 mb-2">Koji podaci se brišu</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Nalog (email adresa, ime i prezime, broj telefona)</li>
          <li>Push tokeni za obavještenja</li>
        </ul>
        <h2 className="text-xl font-bold mt-8 mb-2">Podaci koji se mogu zadržati</h2>
        <p>
          Podaci koje je klub dužan čuvati po propisima (npr. evidencija članarina i finansijska
          dokumentacija) zadržavaju se u zakonskom roku i nijesu vezani za korisnički nalog u
          aplikaciji.
        </p>
        <p className="mt-8">
          Više o obradi podataka:{" "}
          <a href="/privatnost" className="underline">
            Politika privatnosti
          </a>
          .
        </p>
      </div>
    </div>
  );
}

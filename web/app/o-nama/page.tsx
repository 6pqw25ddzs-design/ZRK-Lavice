import Image from 'next/image';

const osnivaci = [
  {
    ime: 'Milena Raičević',
    rodjenaKao: 'rođena Knežević',
    godRodjenja: '1990, Podgorica',
    uloga: 'Osnivačica i predsjednica kluba',
    foto: '/osnivaci/milena.JPG',
    bio: 'Milena Raičević jedna je od najvećih rukometašica u istoriji Crne Gore i jedna od najprepoznatljivijih ličnosti crnogorskog sporta. Tokom izuzetne karijere ostvarila je vrhunske rezultate na klupskom i reprezentativnom nivou, ostavljajući dubok trag na evropskoj i svjetskoj rukometnoj sceni. Kao dugogodišnji lider reprezentacije Crne Gore i osvajačica najvećih trofeja, svojim iskustvom, autoritetom i posvećenošću predstavlja snažan oslonac u izgradnji vizije ŽRK Lavice. Njena želja da stečeno znanje i vrijednosti prenese na nove generacije temelj je na kojem klub gradi svoju budućnost.',
    trofeji: [
      '🥈 Srebrna medalja na Olimpijskim igrama u Londonu 2012. godine',
      '🥇 Zlatna medalja na Evropskom prvenstvu u Beogradu 2012. godine',
      '🥉 Bronzana medalja na Evropskom prvenstvu u Ljubljani 2022. godine',
      '🏆 Osvajačica EHF Lige šampiona 2012. i 2015. godine',
      '🏆 Osvajačica EHF Kupa kupova 2010. godine',
      '🥉 Bronzana medalja na Svjetskom juniorskom prvenstvu u Seulu 2010. godine',
    ],
  },
  {
    ime: 'Radmila Petrović',
    rodjenaKao: 'rođena Miljanić',
    godRodjenja: '1988, Nikšić',
    uloga: 'Osnivačica i direktorica kluba',
    foto: '/osnivaci/radmila.JPG',
    bio: 'Radmila Petrović pripada generaciji rukometašica koja je ispisala najljepše stranice crnogorskog rukometa. Tokom bogate međunarodne karijere nastupala je na najvećim svjetskim i evropskim takmičenjima, ostvarujući vrhunske rezultate na klupskom i reprezentativnom nivou. Iskustvo stečeno na najvišem nivou, prirodne liderske osobine i posvećenost razvoju mladih igračica čine je jednim od ključnih nosilaca vizije i razvoja ŽRK Lavice. Kao osnivačica i direktorica kluba, svoju energiju i znanje usmjerava ka stvaranju zdravog i podsticajnog okruženja u kojem će nove generacije rukometašica imati priliku da rastu, napreduju i ostvaruju svoje sportske snove.',
    trofeji: [
      '🥈 Srebrna medalja na Olimpijskim igrama u Londonu 2012. godine',
      '🥇 Zlatna medalja na Evropskom prvenstvu u Beogradu 2012. godine',
      '🏆 Osvajačica EHF Lige šampiona 2012. i 2015. godine',
      '🏆 Osvajačica EHF Kupa kupova 2010. godine',
    ],
  },
  {
    ime: 'Anđela Bulatović',
    rodjenaKao: 'rođena Dragutinović',
    godRodjenja: '1986, Podgorica',
    uloga: 'Osnivačica i trenerica kluba',
    foto: '/osnivaci/andjela.JPG',
    bio: 'Anđela Bulatović jedna je od istinskih legendi crnogorskog rukometa i članica generacije koja je ostvarila najveće uspjehe u istoriji našeg sporta. Tokom bogate igračke karijere osvajala je najprestižnije trofeje na evropskoj sceni i bila važan dio reprezentacije Crne Gore koja je ispisala nezaboravne stranice rukometne istorije. Njena energija, takmičarski duh i ogromno iskustvo danas su usmjereni ka radu sa mladim igračicama. Kao osnivačica i trenerica ŽRK Lavice, posvećena je stvaranju sredine u kojoj će nove generacije rukometašica razvijati sportske vrijednosti, radne navike i ljubav prema rukometu.',
    trofeji: [
      '🥈 Srebrna medalja na Olimpijskim igrama u Londonu 2012. godine',
      '🥇 Zlatna medalja na Evropskom prvenstvu u Beogradu 2012. godine',
      '🏆 Osvajačica EHF Lige šampiona 2012. godine',
      '🏆 Osvajačica EHF Kupa kupova 2006. i 2010. godine',
    ],
  },
  {
    ime: 'Sonja Barjaktarović',
    rodjenaKao: '',
    godRodjenja: '1986, Berane',
    uloga: 'Osnivačica i trenerica kluba',
    foto: '/osnivaci/sonja.jpg',
    bio: 'Sonja Barjaktarović jedna je od najuspješnijih golmanki u istoriji crnogorskog rukometa i članica generacije koja je ostvarila najveće uspjehe naše reprezentacije. Kao višestruka evropska i olimpijska medaljistkinja, tokom bogate karijere bila je sinonim za posvećenost, borbenost i pobjednički karakter. Nakon uspješne igračke karijere, svoju ljubav prema rukometu usmjerila je ka radu sa mladim generacijama. Kao osnivačica i trenerica ŽRK Lavice, posvećena je prenošenju znanja, iskustva i vrijednosti koje su obilježile njenu karijeru, stvarajući okruženje u kojem djevojčice mogu da rastu kao sportistkinje i kao ličnosti.',
    trofeji: [
      '🥈 Srebrna medalja na Olimpijskim igrama u Londonu 2012. godine',
      '🥇 Zlatna medalja na Evropskom prvenstvu u Beogradu 2012. godine',
      '🏆 Osvajačica EHF Lige šampiona 2012. godine',
      '🏆 Osvajačica EHF Kupa kupova 2006. i 2010. godine',
    ],
  },
  {
    ime: 'Igor Marković',
    rodjenaKao: '',
    godRodjenja: '1981, Cetinje',
    uloga: 'Osnivač i trener kluba',
    foto: '/osnivaci/igor.jpg',
    bio: 'Igor Marković je nekadašnji reprezentativac Crne Gore i jedan od istaknutih članova generacije koja je godinama predstavljala našu zemlju na najvećim međunarodnim takmičenjima. Kroz bogatu karijeru stekao je dragocjeno iskustvo nastupajući na evropskim i svjetskim prvenstvima, gradeći prepoznatljiv sportski autoritet i duboko razumijevanje rukometne igre. Kao osnivač i trener ŽRK Lavice, svoje znanje i iskustvo stavlja u službu razvoja mladih rukometašica, sa jasnom željom da kroz kvalitetan rad, posvećenost i prave vrijednosti doprinese stvaranju novih generacija uspješnih sportistkinja.',
    trofeji: [
      '🌍 Višestruki učesnik Evropskih prvenstava sa muškom rukometnom reprezentacijom Crne Gore',
      '🌍 Višestruki učesnik Svjetskih prvenstava sa muškom rukometnom reprezentacijom Crne Gore',
    ],
  },
];

export default function ONamaPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2A1A1A 100%)' }} className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p style={{ color: 'var(--gold)' }} className="text-sm font-bold tracking-widest uppercase mb-4">Ko smo mi</p>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Pet šampiona.<br />
            <span style={{ color: 'var(--primary)' }}>Jedna misija.</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }} className="text-lg max-w-2xl mx-auto leading-relaxed">
            Četiri evropske šampionke i osvajačice srebrne olimpijske medalje i bivši reprezentativac CG pokrenuli su klub sa vizijom u kojem će nove generacije imati priliku da rastu, napreduju i sanjaju sportske snove.
          </p>
          <p style={{ color: 'var(--text-muted)' }} className="text-lg max-w-2xl mx-auto leading-relaxed mt-4">
            Vođeni iskustvima stečenim na najvećim svjetskim i evropskim pozornicama, osnivači ŽRK Lavice žele da mladim rukometašicama pruže iste prilike, podršku i vrijednosti koje su i sami imali na putu ka vrhunskim rezultatima.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)' }} className="py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '4', label: 'Evropske šampionke' },
            { value: '4', label: 'Olimpijske medalje' },
            { value: '6', label: 'Lige šampiona' },
            { value: '6', label: 'EHF Kup kupova' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ color: 'var(--primary)' }} className="text-3xl font-black">{s.value}</div>
              <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Osnivači */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-10">
          {osnivaci.map((o) => (
            <div key={o.ime} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-2xl overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Fotografija */}
                <div className="relative w-full h-64 md:w-56 md:h-auto md:min-h-[240px] shrink-0">
                  <Image
                    src={o.foto}
                    alt={o.ime}
                    fill
                    className="object-cover object-top"
                  />
                </div>

                {/* Info */}
                <div className="p-6 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <div>
                      <h2 className="text-xl font-black text-white">{o.ime}</h2>
                      {o.rodjenaKao && <span style={{ color: 'var(--text-muted)' }} className="text-sm">{o.rodjenaKao}</span>}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span style={{ backgroundColor: 'var(--primary)', color: 'white' }} className="text-xs font-bold px-3 py-1 rounded-full">{o.uloga}</span>
                      {o.godRodjenja && <span style={{ color: 'var(--text-muted)' }} className="text-xs">{o.godRodjenja}</span>}
                    </div>
                  </div>

                  <p style={{ color: 'var(--text-muted)', textAlign: 'justify' }} className="text-sm leading-relaxed mt-3 mb-4">{o.bio}</p>

                  <div className="flex flex-col gap-1">
                    {o.trofeji.map(t => (
                      <div key={t} className="text-sm text-white">{t}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

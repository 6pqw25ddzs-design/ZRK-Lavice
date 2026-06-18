import { PrismaClient, TeamCategory, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ZRK Lavice database...');

  // Admin korisnik
  const adminHash = await bcrypt.hash('Admin1234!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@zrklavice.me' },
    update: {},
    create: { email: 'admin@zrklavice.me', passwordHash: adminHash, fullName: 'Admin Lavice', role: UserRole.admin },
  });

  // Treneri
  const coachData = [
    { email: 'milena.pavlovic@zrklavice.me', name: 'Milena Pavlović', bio: 'Bivša reprezentativka CG, UEFA A licenca, 12 god iskustva.' },
    { email: 'ana.jokic@zrklavice.me', name: 'Ana Jokić', bio: 'Olimpijska učesnica 2016, specijalizovana za mlade kategorije.' },
    { email: 'bojana.rakovic@zrklavice.me', name: 'Bojana Raković', bio: 'Prvakinja CG 5× zaredom, trener s EHF licencom.' },
  ];

  const coachPass = await bcrypt.hash('Trener1234!', 12);
  const coaches = [];
  for (const c of coachData) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: { email: c.email, passwordHash: coachPass, fullName: c.name, role: UserRole.coach },
    });
    coaches.push({ user, bio: c.bio });
  }

  // Ekipe
  const teams = await Promise.all([
    prisma.team.upsert({ where: { id: '11111111-0000-0000-0000-000000000001' }, update: {}, create: { id: '11111111-0000-0000-0000-000000000001', name: 'Mini rukomet', category: TeamCategory.mini, season: '2025/26' } }),
    prisma.team.upsert({ where: { id: '11111111-0000-0000-0000-000000000002' }, update: {}, create: { id: '11111111-0000-0000-0000-000000000002', name: 'Pionirska liga', category: TeamCategory.pioniri, birthYear: 2012, season: '2025/26' } }),
    prisma.team.upsert({ where: { id: '11111111-0000-0000-0000-000000000003' }, update: {}, create: { id: '11111111-0000-0000-0000-000000000003', name: 'Prva liga', category: TeamCategory.prva_liga, birthYear: 2010, season: '2025/26' } }),
  ]);

  // Dodijeli trenere ekipama
  for (let i = 0; i < teams.length; i++) {
    await prisma.coach.upsert({
      where: { userId: coaches[i].user.id },
      update: {},
      create: {
        userId: coaches[i].user.id,
        teamId: teams[i].id,
        bio: coaches[i].bio,
        licenseNo: `EHF-${1001 + i}`,
        isHeadCoach: true,
      },
    });
  }

  // Igračice — 5 po ekipi
  const playerNames = [
    [['Ana', 'Nikolić'], ['Maja', 'Jovanović'], ['Tamara', 'Vukić'], ['Jelena', 'Petrović'], ['Sara', 'Đurović']],
    [['Katarina', 'Bošković'], ['Sara', 'Radonjić'], ['Nikolina', 'Petrović'], ['Mila', 'Vuković'], ['Jovana', 'Lazović']],
    [['Milica', 'Vuković'], ['Jovana', 'Đurović'], ['Aleksandra', 'Lazović'], ['Bojana', 'Nikolić'], ['Tanja', 'Marković']],
  ];

  const positions = ['Golman', 'Lijevo krilo', 'Pivot', 'Centar', 'Bek'];
  const birthYears = [2014, 2012, 2010];

  for (let t = 0; t < teams.length; t++) {
    for (let p = 0; p < 5; p++) {
      const [first, last] = playerNames[t][p];
      await prisma.player.create({
        data: {
          teamId: teams[t].id,
          firstName: first,
          lastName: last,
          birthDate: new Date(`${birthYears[t]}-0${p + 1}-15`),
          jerseyNumber: p + 1,
          position: positions[p],
        },
      }).catch(() => {}); // ignore duplicates on re-seed
    }
  }

  // Raspored — tekući mjesec
  const base = new Date();
  const events = [
    { teamId: teams[0].id, type: 'training' as const, title: 'Trening — Mini rukomet', location: 'SC Morača, Sala 2', days: [1, 3, 5], hour: 17 },
    { teamId: teams[1].id, type: 'training' as const, title: 'Trening — Pioniri', location: 'SC Morača, Sala 2', days: [2, 4], hour: 16 },
    { teamId: teams[2].id, type: 'training' as const, title: 'Trening — Prva liga', location: 'SC Morača, Sala 1', days: [1, 3, 5], hour: 18 },
  ];

  for (const ev of events) {
    for (let d = 0; d < 30; d++) {
      const date = new Date(base);
      date.setDate(base.getDate() + d);
      if (ev.days.includes(date.getDay())) {
        const startsAt = new Date(date);
        startsAt.setHours(ev.hour, 0, 0, 0);
        const endsAt = new Date(startsAt);
        endsAt.setHours(ev.hour + 1, 30, 0, 0);
        await prisma.scheduleEvent.create({ data: { teamId: ev.teamId, type: ev.type, title: ev.title, location: ev.location, startsAt, endsAt } });
      }
    }
  }

  // Utakmice
  const matchDate = new Date(base);
  matchDate.setDate(base.getDate() + 7);
  matchDate.setHours(19, 0, 0, 0);
  await prisma.scheduleEvent.create({
    data: { teamId: teams[2].id, type: 'match', title: 'Prva liga — RK Jedinstvo', location: 'SC Morača, Sala 1', opponent: 'RK Jedinstvo', startsAt: matchDate },
  });

  // Vijesti
  const newsItems = [
    { title: 'Lavice savladale Budućnost u prvenstvenoj utakmici', slug: 'lavice-vs-buducnost-jun-2026', body: 'ZRK Lavice su ostvarile sjajnu pobjedu nad RK Budućnost u premijernom derbiju sezone. Naše djevojke su pokazale sjajan rukomet i zasluženo slavile 28:22.', tags: ['utakmica', 'pioniri'] },
    { title: 'Ljetnji kamp za mlade rukometašice — prijave otvorene', slug: 'ljetnji-kamp-2026', body: 'Prijave za ljetnji rukometni kamp 2026 su otvorene. Kamp se održava od 15. do 25. jula u Bečićima. Ograničen broj mjesta — prijavite se na vrijame!', tags: ['kamp', 'vijest'] },
    { title: 'Novi sponzor pojačava Lavice za narednu sezonu', slug: 'novi-sponzor-2026', body: 'ZRK Lavice sa ponosom objavljuju partnerstvo s novim zlatnim sponzorom. Ova podrška nam omogućava da nastavimo razvoj mladih talenata.', tags: ['sponzor', 'vijest'] },
  ];

  for (const n of newsItems) {
    await prisma.newsArticle.upsert({
      where: { slug: n.slug },
      update: {},
      create: { ...n, authorId: admin.id, isPublished: true, publishedAt: new Date() },
    });
  }

  // Sponzori
  await prisma.sponsor.createMany({
    data: [
      { name: 'Zlatni Sponzor d.o.o.', level: 'gold', websiteUrl: 'https://example.com', isActive: true, sortOrder: 1 },
      { name: 'Srebrni Partner a.d.', level: 'silver', websiteUrl: 'https://example2.com', isActive: true, sortOrder: 2 },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed kompletan!');
  console.log('Admin login: admin@zrklavice.me / Admin1234!');
}

main().finally(() => prisma.$disconnect());

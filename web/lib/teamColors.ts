// Kolor-sistem generacija: jedna boja prati ekipu kroz čitav sajt i aplikaciju.
export const TEAM_META: Record<string, { color: string; soft: string; label: string }> = {
  prva_liga: { color: '#C41230', soft: 'rgba(196,18,48,0.10)', label: 'Prvi tim' },
  pioniri: { color: '#2563EB', soft: 'rgba(37,99,235,0.10)', label: 'Pionirke' },
  mini: { color: '#0D9488', soft: 'rgba(13,148,136,0.10)', label: 'Mini rukomet' },
};
export const teamMeta = (category?: string) =>
  TEAM_META[category || ''] || { color: '#8a8a8a', soft: 'rgba(138,138,138,0.10)', label: 'Klub' };

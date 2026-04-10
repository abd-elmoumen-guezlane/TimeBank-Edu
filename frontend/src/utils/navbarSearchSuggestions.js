/** Priorité : début de chaîne / début d’un prénom-nom > contient la sous-chaîne. Retourne -1 si aucun match. */
export function textMatchRank(text, query) {
  if (!query || !text) return -1;
  const h = String(text).toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  const qq = String(query)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
  if (!qq) return -1;
  if (h.startsWith(qq)) return 0;
  const words = h.split(/\s+/).filter(Boolean);
  if (words.some((w) => w.startsWith(qq))) return 0;
  if (h.includes(qq)) return 1;
  return -1;
}

function bestRank(...candidates) {
  const ok = candidates.filter((r) => r >= 0);
  if (!ok.length) return -1;
  return Math.min(...ok);
}

/**
 * @returns {{ type: string, id: number, primary: string, secondary: string, rank: number }[]}
 */
export function buildStudentNavSuggestions(q, tutors, modules) {
  const query = q.trim();
  if (!query) return [];
  const published = modules.filter((m) => m.status === 'published' || m.status === 'pending');

  const tutorRows = tutors
    .filter((t) => !t.suspended)
    .map((t) => {
      const rank = textMatchRank(t.name, query);
      if (rank < 0) return null;
      return { type: 'tutor', id: t.id, primary: t.name, secondary: t.filiere ? `${t.filiere} · Tuteur` : 'Tuteur', rank };
    })
    .filter(Boolean);

  const moduleRows = published
    .map((m) => {
      const rank = bestRank(textMatchRank(m.title, query), textMatchRank(m.tutor, query));
      if (rank < 0) return null;
      return { type: 'module', id: m.id, primary: m.title, secondary: m.tutor, rank };
    })
    .filter(Boolean);

  return [...tutorRows, ...moduleRows]
    .sort((a, b) => a.rank - b.rank || a.primary.localeCompare(b.primary, 'fr'))
    .slice(0, 8);
}

export function buildTutorNavSuggestions(q, students, modules, tutorId) {
  const query = q.trim();
  if (!query) return [];
  const mine = modules.filter((m) => m.tutorId === tutorId);

  const studentRows = students
    .filter((s) => !s.suspended)
    .map((s) => {
      const rank = textMatchRank(s.name, query);
      if (rank < 0) return null;
      return { type: 'student', id: s.id, primary: s.name, secondary: 'Étudiant', rank };
    })
    .filter(Boolean);

  const moduleRows = mine
    .map((m) => {
      const rank = bestRank(textMatchRank(m.title, query), textMatchRank(m.category || '', query));
      if (rank < 0) return null;
      return { type: 'tutorModule', id: m.id, primary: m.title, secondary: `${m.level || ''} · ${m.category || 'Module'}`.trim(), rank };
    })
    .filter(Boolean);

  return [...studentRows, ...moduleRows]
    .sort((a, b) => a.rank - b.rank || a.primary.localeCompare(b.primary, 'fr'))
    .slice(0, 8);
}

export function buildAdminNavSuggestions(q, students, tutors) {
  const query = q.trim();
  if (!query) return [];
  const rows = [];
  for (const u of students.filter((s) => !s.suspended)) {
    const rank = textMatchRank(u.name, query);
    if (rank >= 0) rows.push({ type: 'adminUser', roleKey: 'student', id: u.id, primary: u.name, secondary: 'Étudiant', rank });
  }
  for (const u of tutors.filter((t) => !t.suspended)) {
    const rank = textMatchRank(u.name, query);
    if (rank >= 0) rows.push({ type: 'adminUser', roleKey: 'tutor', id: u.id, primary: u.name, secondary: 'Tuteur', rank });
  }
  return rows.sort((a, b) => a.rank - b.rank || a.primary.localeCompare(b.primary, 'fr')).slice(0, 8);
}

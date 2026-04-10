import { Code, Sigma, Database, Briefcase, FileCode, GitBranch, BookOpen } from 'lucide-react';

const TITLE_TO_ICON = {
  Algorithme: Code,
  'Analyse 1': Sigma,
  'Base de Données': Database,
  Comptabilité: Briefcase,
  Python: FileCode,
  'Structures de Données': GitBranch,
  'Structure de Données': GitBranch,
};

export default function ModuleIcon({ title, size = 20, className = '' }) {
  const Icon = TITLE_TO_ICON[title] || BookOpen;
  return <Icon size={size} className={className} aria-hidden />;
}

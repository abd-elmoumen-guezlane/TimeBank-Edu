export default function Avatar({ initials, size = 'md', color = 'teal', src, alt }) {
  const sizes = { xs: 'w-7 h-7 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg' };
  const colors = {
    teal: 'bg-primary-100 text-primary-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
    green: 'bg-green-100 text-green-700',
  };
  const label = alt || (typeof initials === 'string' ? `Avatar ${initials}` : 'Photo de profil');
  if (src) return <img src={src} alt={label} className={`${sizes[size]} rounded-full object-cover border border-gray-200 dark:border-gray-600`} />;
  return (
    <div className={`${sizes[size]} ${colors[color] || colors.teal} rounded-full flex items-center justify-center font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
}

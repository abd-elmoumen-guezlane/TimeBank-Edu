import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, BookOpen, Search, FileText, History, BarChart2, User, LogOut, Bell, ChevronDown, Menu, X, Check, MessageCircle, Calendar, Shield, Users, Settings, AlertTriangle, CreditCard, HelpCircle, Layers, Megaphone, ShieldAlert, ClipboardList } from 'lucide-react';
import { filterNotificationsForUser } from '../../utils/notificationVisibility';
import { useApp } from '../../context/AppContext';
import Avatar from '../common/Avatar';
import { buildStudentNavSuggestions, buildTutorNavSuggestions, buildAdminNavSuggestions } from '../../utils/navbarSearchSuggestions';

const studentMenu = [
  { icon: LayoutDashboard, labelKey: 'nav.student.dashboard', path: '/student/dashboard' },
  { icon: BookOpen, labelKey: 'nav.student.tutorats', path: '/student/tutorats' },
  { icon: ShieldAlert, labelKey: 'nav.student.discipline', path: '/student/discipline' },
  { icon: Search, labelKey: 'nav.student.findModule', path: '/student/modules' },
  { icon: FileText, labelKey: 'nav.student.requests', path: '/student/demandes' },
  { icon: History, labelKey: 'nav.student.history', path: '/student/historique' },
  { icon: BarChart2, labelKey: 'nav.student.stats', path: '/student/stats' },
  { icon: User, labelKey: 'nav.student.profile', path: '/student/profil' },
];

const tutorMenu = [
  { icon: LayoutDashboard, labelKey: 'nav.tutor.dashboard', path: '/tutor/dashboard' },
  { icon: Megaphone, labelKey: 'nav.tutor.offers', path: '/tutor/offres' },
  { icon: FileText, labelKey: 'nav.tutor.requests', path: '/tutor/demandes' },
  { icon: Calendar, labelKey: 'nav.tutor.planning', path: '/tutor/planning' },
  { icon: BarChart2, labelKey: 'nav.tutor.stats', path: '/tutor/stats' },
  { icon: User, labelKey: 'nav.tutor.profile', path: '/tutor/profil' },
];

const adminMenu = [
  { icon: LayoutDashboard, labelKey: 'nav.admin.dashboard', path: '/admin/dashboard' },
  { icon: Users, labelKey: 'nav.admin.users', path: '/admin/users' },
  { icon: Layers, labelKey: 'nav.admin.modules', path: '/admin/modules' },
  { icon: CreditCard, labelKey: 'nav.admin.transactions', path: '/admin/transactions' },
  { icon: ClipboardList, labelKey: 'nav.admin.signalements', path: '/admin/signalements' },
  { icon: AlertTriangle, labelKey: 'nav.admin.disputes', path: '/admin/litiges' },
  { icon: BarChart2, labelKey: 'nav.admin.stats', path: '/admin/stats' },
  { icon: Settings, labelKey: 'nav.admin.settings', path: '/admin/parametres' },
];

export default function DashboardLayout({ children }) {
  const { currentUser, logout, notifications, markNotifRead, markAllNotifRead, tutors, modules, students, t } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeSuggest, setActiveSuggest] = useState(-1);
  const searchWrapRef = useRef(null);

  const role = currentUser?.role;
  const isAdmin = role === 'admin';

  const navSuggestions = useMemo(() => {
    const q = navSearch;
    if (role === 'student') return buildStudentNavSuggestions(q, tutors, modules);
    if (role === 'tutor') return buildTutorNavSuggestions(q, students, modules, currentUser?.id);
    if (isAdmin) return buildAdminNavSuggestions(q, students, tutors);
    return [];
  }, [navSearch, role, isAdmin, tutors, modules, students, currentUser?.id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q')?.trim();
    if (!q) return;
    if (location.pathname === '/student/modules' || location.pathname === '/tutor/offres' || location.pathname === '/admin/users') {
      setNavSearch(q);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    setActiveSuggest(-1);
  }, [navSuggestions]);

  useEffect(() => {
    const close = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) setSuggestOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const menu = role === 'admin' ? adminMenu : role === 'tutor' ? tutorMenu : studentMenu;
  const visibleNotifications = useMemo(
    () => filterNotificationsForUser(notifications, currentUser),
    [notifications, currentUser],
  );
  const unread = visibleNotifications.filter((n) => !n.read).length;

  const handleLogout = () => { logout(); navigate('/'); };

  const pickNavSuggestion = (s) => {
    setSuggestOpen(false);
    setActiveSuggest(-1);
    setNavSearch('');
    if (s.type === 'tutor') navigate(`/tuteurs/${s.id}`);
    else if (s.type === 'module') navigate(`/modules/${s.id}`);
    else if (s.type === 'student') navigate('/tutor/chat', { state: { openWithId: s.id } });
    else if (s.type === 'tutorModule') navigate(`/modules/${s.id}`);
    else if (s.type === 'adminUser') navigate(`/admin/users?q=${encodeURIComponent(s.primary)}`);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-md shadow-primary-900/20">
          <GraduationCap size={18} className="text-white" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white">
          TimeBank <span className="text-primary-600 dark:text-primary-400">Edu</span>
        </span>
        {isAdmin && (
          <span className="text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-1.5 py-0.5 rounded ml-1">Admin</span>
        )}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menu.map(({ icon: Icon, labelKey, path }) => (
          <Link
            key={path}
            to={path}
            onClick={() => setSidebarOpen(false)}
            className={`sidebar-link ${location.pathname === path ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{t(labelKey)}</span>
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-link w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
        >
          <LogOut size={18} />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-950 ${isAdmin ? 'dark-sidebar' : ''}`}>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col w-56 flex-shrink-0 border-r ${
          isAdmin ? 'bg-gray-900 border-gray-800' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
        }`}
      >
        {isAdmin ? (
          <div className="flex flex-col h-full text-gray-300">
            <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-800">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <GraduationCap size={18} className="text-white" />
              </div>
              <span className="font-bold text-white">TimeBank <span className="text-primary-400">Edu</span> <span className="text-xs text-gray-400">Admin</span></span>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {menu.map(({ icon: Icon, labelKey, path }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${location.pathname === path ? 'bg-primary-600 text-white shadow-md shadow-black/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                  <Icon size={18} />
                  <span>{t(labelKey)}</span>
                </Link>
              ))}
            </nav>
            <div className="px-3 py-4 border-t border-gray-800">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-gray-800 w-full transition-all"
              >
                <LogOut size={18} />
                <span>{t('nav.logout')}</span>
              </button>
            </div>
          </div>
        ) : <SidebarContent />}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-56 bg-white dark:bg-gray-900 h-full shadow-xl z-10 border-r border-gray-200 dark:border-gray-800">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between flex-shrink-0 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button type="button" className="lg:hidden shrink-0 text-gray-600 dark:text-gray-300" onClick={() => setSidebarOpen(true)} aria-label="Menu">
              <Menu size={20} />
            </button>
            <div ref={searchWrapRef} className="relative flex-1 min-w-0 max-w-xl sm:max-w-md sm:w-64 sm:flex-none z-[60]">
              <form
                className="relative"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (activeSuggest >= 0 && navSuggestions[activeSuggest]) {
                    pickNavSuggestion(navSuggestions[activeSuggest]);
                    return;
                  }
                  const q = navSearch.trim();
                  const suffix = q ? `?q=${encodeURIComponent(q)}` : '';
                  if (role === 'student') navigate(`/student/modules${suffix}`);
                  else if (role === 'tutor') navigate(`/tutor/offres${suffix}`);
                  else if (isAdmin) navigate(`/admin/users${suffix}`);
                  setSuggestOpen(false);
                }}
              >
                <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden />
                <input
                  type="search"
                  name="q"
                  value={navSearch}
                  onChange={(e) => {
                    setNavSearch(e.target.value);
                    setSuggestOpen(true);
                  }}
                  onFocus={() => setSuggestOpen(true)}
                  onKeyDown={(e) => {
                    if (!suggestOpen || navSuggestions.length === 0) return;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setActiveSuggest((i) => Math.min(i + 1, navSuggestions.length - 1));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setActiveSuggest((i) => Math.max(i - 1, -1));
                    } else if (e.key === 'Escape') {
                      setSuggestOpen(false);
                    }
                  }}
                  placeholder={isAdmin ? t('nav.searchPlaceholderAdmin') : t('nav.searchPlaceholder')}
                  className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/90 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  autoComplete="off"
                  enterKeyHint="search"
                  role="combobox"
                  aria-expanded={suggestOpen && navSuggestions.length > 0}
                  aria-controls="nav-search-suggestions"
                  aria-activedescendant={activeSuggest >= 0 ? `nav-suggest-${activeSuggest}` : undefined}
                />
              </form>
              {suggestOpen && navSuggestions.length > 0 && (
                <ul
                  id="nav-search-suggestions"
                  role="listbox"
                  className="absolute left-0 right-0 top-full mt-1 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-72 overflow-y-auto"
                >
                  {navSuggestions.map((s, i) => (
                    <li key={s.type === 'adminUser' ? `admin-${s.roleKey}-${s.id}` : `${s.type}-${s.id}`} role="option" id={`nav-suggest-${i}`} aria-selected={i === activeSuggest}>
                      <button
                        type="button"
                        className={`w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/80 ${i === activeSuggest ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}
                        onMouseEnter={() => setActiveSuggest(i)}
                        onClick={() => pickNavSuggestion(s)}
                      >
                        <span className="mt-0.5 flex-shrink-0 text-gray-400">
                          {s.type === 'tutor' || s.type === 'student' || s.type === 'adminUser' ? <User size={14} /> : <BookOpen size={14} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium text-sm text-gray-900 dark:text-white truncate">{s.primary}</span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">{s.secondary}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-expanded={notifOpen}
                aria-label={t('nav.notifications')}
              >
                <Bell size={18} className="text-gray-600 dark:text-gray-300" />
                {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{unread}</span>}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-11 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50">
                  <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">{t('nav.notifications')}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {unread > 0 && (
                        <button
                          type="button"
                          onClick={() => markAllNotifRead()}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/40 transition-colors"
                          title={t('nav.markAllRead')}
                          aria-label={t('nav.markAllRead')}
                        >
                          <Check size={16} strokeWidth={2.5} aria-hidden />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setNotifOpen(false)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500"
                        aria-label="Fermer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {visibleNotifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          if (!n.locked) markNotifRead(n.id);
                          if (n.locked && role === 'student') navigate('/student/discipline');
                        }}
                        className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-700/80 flex gap-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40 ${!n.read ? 'bg-primary-50 dark:bg-primary-900/25' : ''}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-700 dark:text-gray-200">{n.text}</p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{n.time}</p>
                          {n.locked ? (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                              Action requise — cliquez pour répondre
                            </p>
                          ) : null}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 text-center border-t border-gray-50 dark:border-gray-700">
                    <Link
                      to={`/${role}/notifications`}
                      className="text-xs text-primary-600 dark:text-primary-400 font-medium"
                      onClick={() => setNotifOpen(false)}
                    >
                      {t('nav.seeAllNotifications')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link
              to={`/${role}/profil`}
              className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 py-1 transition-colors"
            >
              <Avatar initials={currentUser?.avatar || 'U'} src={currentUser?.avatarPhoto} size="sm" alt={currentUser?.name} />
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
                {currentUser?.name?.split(' ')[0] || 'User'}
              </span>
              <ChevronDown size={14} className="text-gray-400 dark:text-gray-500" />
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-950">{children}</main>
      </div>
    </div>
  );
}

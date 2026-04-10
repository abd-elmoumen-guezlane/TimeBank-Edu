import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, GraduationCap, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, t } = useApp();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [role, setRole] = useState('student');

  const handleSubmit = (e) => {
    e.preventDefault();
    login(form.email, role);
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'tutor') navigate('/tutor/dashboard');
    else navigate('/student/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12 max-w-md mx-auto w-full">
        <Link to="/" className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-900/20">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white">
            TimeBank <span className="text-primary-600 dark:text-primary-400">Edu</span>
          </span>
        </Link>

        <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 px-3 py-1 rounded-full">
              {t('login.badge')}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-3">{t('login.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('login.subtitle')}</p>
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
            {['student', 'tutor', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${role === r ? 'bg-white dark:bg-gray-700 shadow text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                {r === 'student' ? t('login.roleStudent') : r === 'tutor' ? t('login.roleTutor') : t('login.roleAdmin')}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('login.email')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  placeholder={t('login.emailPh')}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-9 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('login.password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder={t('login.passwordPh')}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-9 pr-10 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                {t('login.forgot')}
              </Link>
            </div>
            <button type="submit" className="btn-primary w-full py-3 text-base">
              {t('login.submit')} <ArrowRight size={18} />
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            {t('login.noAccount')}{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              {t('login.register')}
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-primary-900 dark:from-primary-800 dark:to-gray-900 items-center justify-center p-12">
        <div className="text-white text-center max-w-sm">
          <div className="w-20 h-20 bg-white/20 dark:bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <GraduationCap size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">{t('login.heroTitle')}</h2>
          <p className="text-primary-100 dark:text-gray-300 text-lg">{t('login.heroText')}</p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { val: '500+', labelKey: 'login.statStudents' },
              { val: '1200+', labelKey: 'login.statTutoring' },
              { val: '4.8/5', labelKey: 'login.statRating' },
              { val: '45+', labelKey: 'login.statModules' },
            ].map((s) => (
              <div key={s.labelKey} className="bg-white/10 dark:bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold">{s.val}</div>
                <div className="text-primary-200 dark:text-gray-400 text-sm">{t(s.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  GraduationCap,
  ArrowRight,
  Shield,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
} from 'lucide-react';

const STEPS = [
  { n: 1, label: 'Email' },
  { n: 2, label: 'Code' },
  { n: 3, label: 'Mot de passe' },
];

/** Démo locale : code accepté pour passer à l’étape suivante. */
const DEMO_VALIDATION_CODE = '123456';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  const goBack = () => {
    setError('');
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError('');
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Veuillez entrer une adresse email valide.');
      return;
    }
    setStep(2);
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    setError('');
    const c = code.replace(/\s/g, '');
    if (c.length !== 6) {
      setError('Le code doit contenir 6 chiffres.');
      return;
    }
    if (c !== DEMO_VALIDATION_CODE) {
      setError('Code incorrect. En démo, utilisez 123456.');
      return;
    }
    setStep(3);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12 max-w-md mx-auto w-full">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-900/20">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white">
            TimeBank <span className="text-primary-600 dark:text-primary-400">Edu</span>
          </span>
        </Link>

        <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          {/* Indicateur d’étapes */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                    step > s.n
                      ? 'bg-primary-600 text-white'
                      : step === s.n
                        ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {step > s.n ? '✓' : s.n}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-0.5 rounded ${step > s.n ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                    aria-hidden
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-6">
            Étape {Math.min(step, 3)} sur 3 — {STEPS[Math.min(step, 3) - 1]?.label}
          </p>

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          ) : null}

          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail size={28} className="text-primary-600 dark:text-primary-400" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Votre email</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  Indiquez l’adresse de votre compte. Nous vous enverrons un code de validation.
                </p>
              </div>
              <div>
                <label htmlFor="fp-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email universitaire
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    id="fp-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@univ.dz"
                    className="input-field pl-9 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-3">
                Envoyer le code <ArrowRight size={18} />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleCodeSubmit} className="space-y-5">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 -mt-2 mb-2"
              >
                <ChevronLeft size={18} /> Modifier l’email
              </button>
              <div className="text-center">
                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield size={28} className="text-amber-600 dark:text-amber-400" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Code de validation</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  Saisissez le code à 6 chiffres envoyé à{' '}
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{email.trim()}</span>
                </p>
              </div>
              <div>
                <label htmlFor="fp-code" className="sr-only">
                  Code à 6 chiffres
                </label>
                <input
                  id="fp-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="input-field text-center text-2xl font-mono tracking-[0.5em] dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
                  Démo : code <span className="font-mono font-semibold text-primary-600 dark:text-primary-400">123456</span>
                </p>
              </div>
              <button type="submit" className="btn-primary w-full py-3">
                Vérifier le code <ArrowRight size={18} />
              </button>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Pas reçu ?{' '}
                <button
                  type="button"
                  className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                  onClick={() => setError('')}
                >
                  Renvoyer le code
                </button>
              </p>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 -mt-2 mb-2"
              >
                <ChevronLeft size={18} /> Retour au code
              </button>
              <div className="text-center">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <KeyRound size={28} className="text-primary-600 dark:text-primary-400" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Nouveau mot de passe</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  Choisissez un mot de passe sécurisé (minimum 8 caractères).
                </p>
              </div>
              <div>
                <label htmlFor="fp-new" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    id="fp-new"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field pl-9 pr-10 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
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
              <div>
                <label htmlFor="fp-confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    id="fp-confirm"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-9 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-3">
                Enregistrer le mot de passe <ArrowRight size={18} />
              </button>
            </form>
          )}

          {step === 4 && (
            <div className="text-center space-y-5">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 rounded-2xl flex items-center justify-center mx-auto">
                <Shield size={28} className="text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mot de passe mis à jour</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <button type="button" onClick={() => navigate('/login')} className="btn-primary w-full py-3">
                Aller à la connexion <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step < 4 ? (
            <Link
              to="/login"
              className="block text-center text-sm text-primary-600 dark:text-primary-400 mt-6 hover:underline"
            >
              Retour à la connexion
            </Link>
          ) : null}
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-primary-900 dark:from-primary-800 dark:to-gray-900 items-center justify-center p-12">
        <div className="text-white text-center max-w-sm">
          <div className="w-20 h-20 bg-white/20 dark:bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <KeyRound size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Réinitialisation sécurisée</h2>
          <p className="text-primary-100 dark:text-gray-300 text-lg leading-relaxed">
            Email, puis code de vérification, puis nouveau mot de passe — trois étapes pour retrouver l’accès à votre compte en
            toute sécurité.
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Button, TextInput } from '../components/ui/Primitives';
import { Notice, Spinner } from '../components/ui/Feedback';
import { usePageMeta } from '../lib/seo';
import { parseSiteCopy, usePublicSiteSettings } from '../lib/siteSettings';
import Logo from '../components/art/Logo';

const benefits = [
  'حفظ الوظائف المناسبة ومتابعتها',
  'بناء ملف مهني منظم',
  'تنظيم التقديمات ومراحلها',
  'إنشاء تنبيهات للفرص الجديدة',
];

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const isRegister = mode === 'register';
  const { signIn, signUp, configured, session, ready, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const settings = usePublicSiteSettings();
  const cms = parseSiteCopy(settings.auth_copy_ar);
  const text = (key: string, fallback: string) => cms[key] || fallback;

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  usePageMeta({
    title: isRegister ? 'إنشاء حساب | ezyjobs' : 'تسجيل الدخول | ezyjobs',
    description: isRegister
      ? 'أنشئ حساباً في ezyjobs لحفظ الوظائف وبناء ملفك المهني وتنظيم تقديماتك.'
      : 'سجّل الدخول إلى حسابك في ezyjobs للوصول إلى ملفك المهني وتقديماتك المحفوظة.',
    noIndex: true,
  });

  if (ready && session && !busy) {
    navigate(isAdmin ? '/admin' : '/profile', { replace: true });
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegister && password !== confirm) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }

    setBusy(true);
    const err = isRegister ? await signUp(identifier, password) : await signIn(identifier, password);
    setBusy(false);

    if (err) {
      setError(err);
      return;
    }

    const from = (location.state as { from?: string } | null)?.from;
    navigate(from ?? (isAdmin ? '/admin' : '/profile'), { replace: true });
  };

  return (
    <div className="auth-shell relative flex min-h-[calc(100vh-73px)] items-center overflow-hidden bg-gradient-to-br from-white via-[#f7faff] to-[#eef7f5] py-16">
      <div className="ez-grid-light absolute inset-0 opacity-55" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(47,100,214,0.10),transparent_34%),radial-gradient(circle_at_85%_80%,rgba(42,168,132,0.10),transparent_32%)]" />
      <div
        className="anim-drift absolute -left-32 top-10 h-[420px] w-[420px] rounded-full opacity-25 blur-[110px]"
        style={{ background: 'radial-gradient(circle, rgba(47,100,214,0.22) 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto grid w-full max-w-[1240px] gap-14 px-5 lg:grid-cols-2 lg:items-center lg:px-10">
        <div className="text-ink">
          <div className="anim-fade-up flex items-center gap-4">
            <Logo size={54} />
            <span className="inline-block text-[11px] font-bold text-accent">
              <span className="tracking-in inline-block">
                {isRegister ? text('registerEyebrow', 'ACCOUNT') : text('loginEyebrow', 'SIGN IN')}
              </span>
            </span>
          </div>
          <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            {isRegister ? text('registerTitle', 'أنشئ حسابك في ezyjobs') : text('loginTitle', 'تسجيل الدخول')}
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-[1.95] text-muted">
            {isRegister
              ? text('registerLead', 'حساب واحد يجمع ملفك المهني، الوظائف المحفوظة، وتقديماتك في مكان واحد.')
              : text('loginLead', 'ادخل إلى حسابك لمتابعة ملفك المهني وتقديماتك والفرص التي حفظتها.')}
          </p>

          <ul className="mt-10 space-y-3 text-[13.5px] text-muted">
            {benefits.map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                {text(`benefit${benefits.indexOf(t) + 1}`, t)}
              </li>
            ))}
          </ul>
        </div>

        <div className="auth-card ez-card border-line bg-white/92 p-7 shadow-[0_30px_80px_-45px_rgba(23,36,59,0.25)] lg:p-9">
          {!configured && (
            <div className="mb-6">
              <Notice tone="warn" title="Supabase غير مربوط بعد">
                <p>
                  أنشئ ملف <code className="font-mono">.env</code> من{' '}
                  <code className="font-mono">.env.example</code>، وضع{' '}
                  <code className="font-mono">VITE_SUPABASE_URL</code> و{' '}
                  <code className="font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code>، ثم أعد تشغيل
                  الخادم.
                </p>
                <p className="mt-2">
                  ونفّذ <code className="font-mono">supabase/schema.sql</code> في SQL Editor.
                </p>
              </Notice>
            </div>
          )}

          <h2 className="text-xl font-black text-ink">
            {isRegister ? text('registerCardTitle', 'حساب جديد') : text('loginCardTitle', 'تسجيل الدخول')}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {isRegister
              ? 'أنشئ حساباً عادياً للبدء. بعض الصلاحيات الإدارية قد تكون متاحة لحسابات محددة.'
              : 'أدخل البريد الإلكتروني أو اسم المستخدم وكلمة المرور للمتابعة.'}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block">
              <span className="ez-label">{text('identifierLabel', 'البريد الإلكتروني أو اسم المستخدم')}</span>
              <TextInput
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                dir="ltr"
                placeholder="zssalsabil12@gmail.com"
                required
                minLength={3}
                maxLength={254}
              />
              <span className="mt-1.5 block text-[11px] text-muted">
                {text('identifierHint', 'يمكنك التسجيل ببريدك الإلكتروني أو استخدام اسم مستخدم قديم متوافق مع النظام.')}
              </span>
            </label>

            <label className="block">
              <span className="ez-label">{text('passwordLabel', 'كلمة المرور')}</span>
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                dir="ltr"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </label>

            {isRegister && (
              <label className="block">
                <span className="ez-label">{text('confirmPasswordLabel', 'تأكيد كلمة المرور')}</span>
                <TextInput
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  dir="ltr"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </label>
            )}

            {error && <Notice tone="error">{error}</Notice>}

            <Button type="submit" size="lg" block disabled={busy || !configured}>
              {busy && <Spinner />}
              {busy ? text('processing', 'جارٍ المعالجة') : isRegister ? text('submitRegister', 'إنشاء الحساب') : text('submitLogin', 'دخول')}
            </Button>

            {!configured && (
              <p className="text-center text-[11.5px] text-muted">
                الزر معطّل حتى تُضاف مفاتيح Supabase.
              </p>
            )}
          </form>

          <div className="mt-7 border-t border-line pt-5 text-center text-[13px]">
            {isRegister ? (
              <p className="text-muted">
                {text('existingAccount', 'لديك حساب؟')}{' '}
                <Link to="/login" className="font-bold text-brand">
                  {text('loginLink', 'تسجيل الدخول')}
                </Link>
              </p>
            ) : (
              <p className="text-muted">
                {text('noAccount', 'ليس لديك حساب؟')}{' '}
                <Link to="/register" className="font-bold text-brand">
                  {text('registerLink', 'إنشاء حساب')}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

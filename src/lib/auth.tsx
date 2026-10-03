import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, ENV_HINT } from './supabase';

/**
 * Supabase يستخدم البريد الإلكتروني افتراضياً، ونريد اسم مستخدم.
 * لذلك نترجم اسم المستخدم إلى بريد داخلي بصيغة:
 *   username@ezyjobs.local
 * اسم المستخدم الحقيقي يبقى في جدول profiles.
 */
const EMAIL_DOMAIN = 'ezyjobs.local';
const toEmail = (identifier: string) => {
  const value = identifier.trim().toLowerCase();
  return value.includes('@') ? value : `${value}@${EMAIL_DOMAIN}`;
};
const fromEmail = (email: string) => email.split('@')[0] ?? '';
const isRealEmail = (identifier: string) => /[^\s@]+@[^\s@]+\.[^\s@]{2,}/.test(identifier.trim());

export const USERNAME_RULE = /^[a-z0-9_]{3,32}$/;
export const PASSWORD_RULE = /^.{8,}$/;

export type AuthError = string | null;

interface AuthState {
  ready: boolean;
  configured: boolean;
  session: Session | null;
  username: string | null;
  role: 'admin' | 'publisher' | 'seeker';
  isPublisher: boolean;
  isAdmin: boolean;
  signUp: (identifier: string, password: string) => Promise<AuthError>;
  signIn: (identifier: string, password: string) => Promise<AuthError>;
  changePassword: (password: string) => Promise<AuthError>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<'admin' | 'publisher' | 'seeker'>('seeker');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s ?? null);
      setReady(true);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user.id) {
      setRole('seeker');
      return;
    }
    const client = supabase;
    let alive = true;
    client
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!alive) return;
        let nextRole: 'admin' | 'publisher' | 'seeker' =
          data?.role === 'admin' ? 'admin' : data?.role === 'publisher' ? 'publisher' : 'seeker';

        if (nextRole === 'seeker' && session.user.email?.toLowerCase() === 'zssalsabil12@gmail.com') {
          const { data: bootstrap } = await client.rpc('bootstrap_owner_admin');
          if (bootstrap?.ok === true) nextRole = 'admin';
        }

        if (alive) setRole(nextRole);
      });
    return () => {
      alive = false;
    };
  }, [session?.user.id]);

  const signUp = useCallback<AuthState['signUp']>(async (identifier, password) => {
    if (!supabase) return ENV_HINT;
    const value = identifier.trim().toLowerCase();
    const username = isRealEmail(value)
      ? (value.split('@')[0] ?? '').replace(/[^a-z0-9_]/g, '_').slice(0, 32)
      : value;
    if (isRealEmail(value) ? !value : !USERNAME_RULE.test(username))
      return isRealEmail(value)
        ? 'أدخل بريداً إلكترونياً صحيحاً.'
        : 'اسم المستخدم: من 3 إلى 32 حرفاً لاتينياً صغيراً أو رقماً أو شرطة سفلية.';
    if (!PASSWORD_RULE.test(password))
      return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.';

    const { data, error } = await supabase.auth.signUp({
      email: toEmail(value),
      password,
      options: {
        data: { username, display_name: username },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return translate(error.message);

    if (!data.session) {
      return isRealEmail(value)
        ? 'تم إنشاء الحساب. أكّد رسالة البريد الإلكتروني ثم سجّل الدخول.'
        : 'تم إنشاء الحساب. فعّل «Confirm email» من إعدادات مشروع Supabase أو أكّد البريد ثم سجّل الدخول.';
    }
    return null;
  }, []);

  const signIn = useCallback<AuthState['signIn']>(async (identifier, password) => {
    if (!supabase) return ENV_HINT;
    const value = identifier.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithPassword({
      email: toEmail(value),
      password,
    });
    if (error) {
      if (/invalid login credentials/i.test(error.message))
        return 'اسم المستخدم أو كلمة المرور غير صحيحة.';
      return translate(error.message);
    }
    return null;
  }, []);

  const changePassword = useCallback<AuthState['changePassword']>(async (password) => {
    if (!supabase) return ENV_HINT;
    if (!PASSWORD_RULE.test(password)) return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.';
    const { error } = await supabase.auth.updateUser({ password });
    return error ? translate(error.message) : null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
    setSession(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      ready,
      configured: isSupabaseConfigured,
      session,
      username: session?.user ? fromEmail(session.user.email ?? '') : null,
      role,
      isPublisher: Boolean(session?.user) && (role === 'publisher' || role === 'admin'),
      isAdmin: Boolean(session?.user) && role === 'admin',
      signUp,
      signIn,
      changePassword,
      signOut,
    }),
    [ready, session, role, signUp, signIn, changePassword, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

function translate(msg: string): string {
  if (/already registered|already been registered/i.test(msg))
    return 'اسم المستخدم مستخدم بالفعل. اختر اسماً آخر.';
  if (/password should be at least/i.test(msg)) return 'كلمة المرور قصيرة جداً.';
  if (/email rate limit|rate limit/i.test(msg))
    return 'محاولات كثيرة في وقت قصير. انتظر قليلاً ثم أعد المحاولة.';
  if (/Email not confirmed/i.test(msg))
    return 'لم يتم تأكيد البريد بعد. فعّل Confirm email في Supabase أو أكّد الحساب.';
  if (/fetch|network|Failed to fetch/i.test(msg))
    return 'تعذّر الاتصال بخادم Supabase. تحقق من المفاتيح في ملف .env.';
  return msg;
}

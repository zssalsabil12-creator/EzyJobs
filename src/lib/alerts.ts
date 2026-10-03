import { useState } from 'react';
import type { LanguageCode } from '../types';
import { supabase } from './supabase';

export interface JobAlert {
  email: string;
  country: string;
  categories: string[];
  remoteOnly: boolean;
  studentsOnly: boolean;
  noExperienceOnly: boolean;
  language: LanguageCode | 'any';
  frequency: 'daily' | 'weekly';
}

const localKey = (email: string) => `ezyjobs.alert.${email}`;
const tokenKey = (email: string) => `ezyjobs.alert.token.${email}`;

const createManageToken = () => {
  try {
    return `${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '')}`;
  } catch {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`.padEnd(64, '0');
  }
};

const readManageToken = (email: string) => {
  try {
    return localStorage.getItem(tokenKey(email));
  } catch {
    return null;
  }
};

const writeManageToken = (email: string, token: string) => {
  try {
    localStorage.setItem(tokenKey(email), token);
  } catch {
    /* تجاهل */
  }
};

export type AlertResult = { ok: boolean; error: string | null; local: boolean };

export const alertsRepo = {
  /** Supabase أولاً، وتخزين محلي إن لم يكن مربوطاً */
  async subscribe(alert: JobAlert): Promise<AlertResult> {
    const email = alert.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      return { ok: false, error: 'صيغة البريد غير صحيحة.', local: !supabase };

    if (!supabase) {
      try {
        const existing = JSON.parse(localStorage.getItem(localKey(email)) ?? 'null');
        localStorage.setItem(localKey(email), JSON.stringify({ ...(existing ?? {}), ...alert }));
      } catch {
        /* تجاهل */
      }
      return { ok: true, error: null, local: true };
    }

    const manageToken = readManageToken(email) ?? createManageToken();
    const { data, error } = await supabase.rpc('upsert_job_alert', {
      p_email: email,
      p_country: alert.country,
      p_categories: alert.categories,
      p_remote_only: alert.remoteOnly,
      p_students_only: alert.studentsOnly,
      p_no_experience_only: alert.noExperienceOnly,
      p_language: alert.language,
      p_frequency: alert.frequency,
      p_manage_token: manageToken,
    });

    if (error) return { ok: false, error: error.message, local: false };
    const result = (data ?? {}) as { ok?: boolean; reason?: string };
    if (!result.ok) {
      return {
        ok: false,
        error: result.reason === 'token_mismatch'
          ? 'هذا البريد مرتبط بتنبيه موجود مسبقاً. استخدم جهازك الأصلي لإدارته.'
          : 'تعذّر حفظ التنبيه.',
        local: false,
      };
    }
    writeManageToken(email, manageToken);
    return { ok: true, error: null, local: false };
  },

  async unsubscribe(email: string): Promise<AlertResult> {
    const e = email.trim().toLowerCase();
    if (!supabase) {
      localStorage.removeItem(localKey(e));
      localStorage.removeItem(tokenKey(e));
      return { ok: true, error: null, local: true };
    }
    const manageToken = readManageToken(e);
    if (!manageToken) {
      return { ok: false, error: 'لا توجد بيانات إدارة لهذا التنبيه على هذا الجهاز.', local: false };
    }
    const { data, error } = await supabase.rpc('delete_job_alert', {
      p_email: e,
      p_manage_token: manageToken,
    });
    if (error) return { ok: false, error: error.message, local: false };
    const result = (data ?? {}) as { ok?: boolean };
    if (!result.ok) return { ok: false, error: 'تعذّر إلغاء التنبيه من هذا الجهاز.', local: false };
    localStorage.removeItem(tokenKey(e));
    return { ok: true, error: null, local: false };
  },
};

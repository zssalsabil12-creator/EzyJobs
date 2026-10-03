import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export type PublicSiteSettings = Record<string, string>;

export async function loadPublicSiteSettings(): Promise<PublicSiteSettings> {
  if (!supabase) return {};
  const { data } = await supabase.from('site_settings').select('key,value').eq('is_public', true);
  if (!data) return {};
  return Object.fromEntries(
    data.map((row) => [
      row.key,
      typeof row.value === 'string' ? row.value : String(row.value ?? ''),
    ]),
  );
}

export function parseSiteCopy(value: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of (value ?? '').split(/\r?\n/)) {
    const index = line.indexOf('||');
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const text = line.slice(index + 2).trim();
    if (key && text) result[key] = text;
  }
  return result;
}

export function usePublicSiteSettings() {
  const [settings, setSettings] = useState<PublicSiteSettings>({});

  useEffect(() => {
    let alive = true;
    loadPublicSiteSettings().then((next) => {
      if (alive) setSettings(next);
    });
    return () => {
      alive = false;
    };
  }, []);

  return settings;
}

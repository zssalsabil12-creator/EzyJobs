import { useEffect, useRef } from 'react';
import { usePublicSiteSettings } from '../../lib/siteSettings';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

let scriptPromise: Promise<void> | null = null;

function loadAdsense(client: string) {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-ezy-adsense]');
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.ezyAdsense = 'true';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('adsense_load_failed'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}
export default function AdSenseSlot({
  slot,
  className = '',
}: {
  slot?: string;
  className?: string;
}) {
  const settings = usePublicSiteSettings();
  const ref = useRef<HTMLModElement>(null);
  const enabled = settings.ads_enabled === 'true';
  const client = settings.adsense_client?.trim() || '';
  const configuredSlot = slot !== undefined ? slot.trim() : settings.adsense_inline_slot?.trim() || '';

  useEffect(() => {
    if (!enabled || !client || !configuredSlot || !ref.current) return;
    let cancelled = false;
    void loadAdsense(client).then(() => {
      if (cancelled || !ref.current) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // AdSense may refuse initialization until its review/account state is ready.
      }
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, client, configuredSlot]);

  if (!enabled || !client || !configuredSlot) return null;

  return (
    <div className={`mx-auto w-full max-w-[1100px] px-5 py-4 lg:px-10 ${className}`}>
      <ins
        ref={ref}
        className="adsbygoogle block min-h-[90px] w-full"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={configuredSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

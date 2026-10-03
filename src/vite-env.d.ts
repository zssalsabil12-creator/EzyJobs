import { createClient } from '@supabase/supabase-js';

type ImportMetaEnvLike = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnvLike;
  }
}

export {};

declare module 'pdfjs-dist/build/pdf.mjs';
declare module 'pdfjs-dist/build/pdf.worker.min.mjs?url';

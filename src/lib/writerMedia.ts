import { supabase } from './supabase';

export async function uploadWriterImage(userId: string, file: File) {
  if (!supabase) return { url: '', error: 'Supabase غير مربوط.' };
  if (!file.type.startsWith('image/')) return { url: '', error: 'اختر ملف صورة صالحاً.' };
  if (file.size > 8 * 1024 * 1024) return { url: '', error: 'حجم الصورة الأصلي يجب ألا يتجاوز 8MB.' };

  const bitmap = await createImageBitmap(file);
  const maxWidth = 1600;
  const ratio = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
  canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
  const ctx = canvas.getContext('2d');
  if (!ctx) return { url: '', error: 'تعذر معالجة الصورة.' };
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.82));
  if (!blob) return { url: '', error: 'تعذر ضغط الصورة.' };

  const objectName = userId + '/' + crypto.randomUUID() + '.webp';
  const upload = await supabase.storage.from('writer-media').upload(objectName, blob, {
    contentType: 'image/webp',
    cacheControl: '31536000',
    upsert: false,
  });
  if (upload.error) return { url: '', error: upload.error.message };

  const publicUrl = supabase.storage.from('writer-media').getPublicUrl(objectName).data.publicUrl;
  return { url: publicUrl, error: null };
}

import { supabase } from './supabase/client';

export async function uploadImage(file: File): Promise<string | null> {
  // If Supabase is not configured, we gracefully return null
  // This tells the frontend to fallback to localStorage/Base64
  if (!supabase) {
    return null;
  }

  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  // Clean up original file name to avoid weird characters in URL
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
  const filePath = `reports/${timestamp}-${randomId}-${cleanFileName}`;

  const { error } = await supabase.storage
    .from('report-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error('Image upload failed: ' + error.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from('report-images')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

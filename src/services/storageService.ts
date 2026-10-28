import { getSupabase } from '../lib/supabase';

export const STORAGE_BUCKET = 'aerospace-media';

export interface StorageUploadResult {
  success: boolean;
  publicUrl?: string;
  storagePath?: string;
  error?: string;
}

export const StorageService = {
  /**
   * Uploads an image file to the Supabase Storage 'aerospace-media' bucket.
   */
  async uploadComponentImage(
    file: File,
    catalogIdOrNumber: string = 'entry'
  ): Promise<StorageUploadResult> {
    const supabase = getSupabase();

    // If Supabase is not configured, fallback to data URL
    if (!supabase) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            success: true,
            publicUrl: reader.result as string,
            storagePath: `local://offline/${file.name}`,
            error: 'Uploaded locally (Supabase Storage not configured; image saved in local storage).'
          });
        };
        reader.onerror = () => {
          resolve({
            success: false,
            error: 'Failed to read file on device.'
          });
        };
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanPrefix = catalogIdOrNumber.replace(/[^a-z0-9_-]/gi, '').toLowerCase() || 'entry';
      const fileName = `${cleanPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.${fileExt}`;
      const filePath = `entries/${fileName}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.warn('Supabase storage upload error:', error.message);
        // Fallback to data URL so user doesn't lose their image
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              success: true,
              publicUrl: reader.result as string,
              storagePath: `fallback://${filePath}`,
              error: `Storage upload note: ${error.message}. Saved inline fallback.`
            });
          };
          reader.readAsDataURL(file);
        });
      }

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      return {
        success: true,
        publicUrl: urlData.publicUrl,
        storagePath: filePath
      };
    } catch (err: any) {
      console.error('Storage service exception:', err);
      return {
        success: false,
        error: err?.message || 'Failed to complete storage upload.'
      };
    }
  },

  /**
   * Deletes an uploaded image from the Supabase Storage bucket.
   */
  async deleteImage(storagePath: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !storagePath || storagePath.startsWith('local://') || storagePath.startsWith('data:')) {
      return true;
    }

    try {
      const cleanPath = storagePath.replace(/^fallback:\/\//, '');
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([cleanPath]);

      if (error) {
        console.warn('Could not delete storage image:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Failed to delete storage file:', err);
      return false;
    }
  }
};

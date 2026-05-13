/**
 * useStorage — Firebase Storage (modular v9+) ile profil fotoğrafı yükleme.
 * Görsel önce client-side sıkıştırılır, sonra `profiles/{uid}/...` altına yüklenir;
 * dönen HTTPS URL Firestore `photoURL` alanına yazılır.
 */

import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, type UploadTaskSnapshot } from 'firebase/storage';
import { storage } from '@/src/lib/firebase';

const MAX_DIMENSION = 800;
const JPEG_QUALITY = 0.82;

function compressImageToBlob(file: File, maxDimension: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.readAsDataURL(file);

    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context oluşturulamadı.'));
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Görsel oluşturulamadı.'));
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Görsel yüklenemedi.'));
  });
}

interface UploadProgress {
  progress: number;
  error: string | null;
  url: string | null;
}

export function useStorage() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    error: null,
    url: null,
  });

  const uploadFile = useCallback(
    async (file: File, path: string, onProgress?: (progress: number) => void): Promise<string> => {
      if (!storage) {
        const msg = 'Firebase Storage başlatılamadı. Ortam değişkenlerini ve Storage kurulumunu kontrol edin.';
        console.error('[useStorage]', msg);
        throw new Error(msg);
      }

      setUploading(true);
      setUploadProgress({ progress: 0, error: null, url: null });

      try {
        if (!file.type.startsWith('image/')) {
          throw new Error('Sadece resim dosyaları yüklenebilir.');
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Dosya boyutu 5MB\'dan küçük olmalıdır.');
        }

        const blob = await compressImageToBlob(file, MAX_DIMENSION, JPEG_QUALITY);
        const storageRef = ref(storage, path);

        return await new Promise<string>((resolve, reject) => {
          const task = uploadBytesResumable(storageRef, blob, {
            contentType: 'image/jpeg',
          });

          task.on(
            'state_changed',
            (snapshot: UploadTaskSnapshot) => {
              const pct =
                snapshot.totalBytes > 0
                  ? Math.round((100 * snapshot.bytesTransferred) / snapshot.totalBytes)
                  : 0;
              setUploadProgress({ progress: pct, error: null, url: null });
              onProgress?.(pct);
            },
            (err) => {
              console.error('[useStorage] upload error', err);
              const message = err instanceof Error ? err.message : 'Yükleme başarısız oldu.';
              setUploadProgress({ progress: 0, error: message, url: null });
              setUploading(false);
              reject(new Error(message));
            },
            async () => {
              try {
                const url = await getDownloadURL(task.snapshot.ref);
                setUploadProgress({ progress: 100, error: null, url });
                setUploading(false);
                resolve(url);
              } catch (e) {
                console.error('[useStorage] getDownloadURL error', e);
                setUploading(false);
                reject(e instanceof Error ? e : new Error('URL alınamadı.'));
              }
            }
          );
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Görsel yüklenirken bir hata oluştu.';
        console.error('[useStorage]', error);
        setUploadProgress({ progress: 0, error: errorMessage, url: null });
        setUploading(false);
        throw new Error(errorMessage);
      }
    },
    []
  );

  return {
    uploadFile,
    uploading,
    uploadProgress,
  };
}

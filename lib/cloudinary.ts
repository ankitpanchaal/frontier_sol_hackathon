/**
 * SoulStamp — Cloudinary upload helper
 * Uploads an image file client-side (unsigned upload) and returns the secure URL.
 *
 * Setup:
 * 1. Create a free account at cloudinary.com
 * 2. Get your Cloud Name from the dashboard
 * 3. Create an Upload Preset: Settings → Upload → Add preset
 *    - Signing Mode: Unsigned
 *    - Name: soulstamp_badges
 * 4. Add to .env.local:
 *    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=soulstamp_badges
 */

import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@/lib/constants';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

export async function uploadBadgeImage(file: File): Promise<CloudinaryUploadResult> {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error(
      'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set. Add it to .env.local'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'soulstamp/badges');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? 'Cloudinary upload failed');
  }

  return res.json() as Promise<CloudinaryUploadResult>;
}

/** Generate the badge metadata JSON URI (stored as a Cloudinary raw upload) */
export async function uploadBadgeMetadata(metadata: object): Promise<string> {
  const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  const file = new File([blob], 'metadata.json', { type: 'application/json' });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'soulstamp/metadata');
  formData.append('resource_type', 'raw');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    throw new Error('Cloudinary metadata upload failed');
  }

  const data = await res.json() as { secure_url: string };
  return data.secure_url;
}

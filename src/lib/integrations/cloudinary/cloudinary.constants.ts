/**
 * Cloudinary core settings and folder structures.
 */
export const CloudinaryConfig = {
  DOMAIN: 'res.cloudinary.com',
  FORMAT: 'webp',
  QUALITY: 'auto',
  FOLDERS: {
    AVATARS: 'avatars',
    PROPERTIES: 'properties',
  },
} as const;

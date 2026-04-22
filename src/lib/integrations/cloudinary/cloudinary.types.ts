import { CloudinaryConfig } from './cloudinary.constants.js';

export type CloudinaryUploadResult = {
  url: string;
  publicId: string;
};

export type CloudinaryFolder =
  (typeof CloudinaryConfig.FOLDERS)[keyof typeof CloudinaryConfig.FOLDERS];

import { CloudinaryConfig } from './cloudinary.constants.js';

export type CloudinaryFolder =
  (typeof CloudinaryConfig.FOLDERS)[keyof typeof CloudinaryConfig.FOLDERS];

export type CloudinaryUploadParams = {
  fileBuffer: Buffer;
  targetFolder: CloudinaryFolder;
  customPublicId?: string;
};

export type CloudinaryUploadResult = {
  url: string;
  publicId: string;
};

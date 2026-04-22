import type { Request } from 'express';
import multer, { type FileFilterCallback } from 'multer';

import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { RequestConfig } from '@lib/constants/limits.js';
import { HttpError } from '@lib/errors/http.error.js';

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const isValidFormat = (
    RequestConfig.UPLOAD.ALLOWED_IMAGE_MIME_TYPES as readonly string[]
  ).includes(file.mimetype);

  if (isValidFormat) {
    cb(null, true);
  } else {
    cb(
      new HttpError({
        statusCode: 415,
        message: ErrorMessages.UPLOAD.INVALID_FORMAT,
        internalPayload: { code: ErrorCodes.UPLOAD.INVALID_FORMAT },
      }),
    );
  }
};

export const imageUploader = multer({
  storage,
  limits: { fileSize: RequestConfig.UPLOAD.MAX_IMAGE_SIZE_BYTES },
  fileFilter,
});

export const uploadAvatarMiddleware = imageUploader.single(RequestConfig.UPLOAD.FIELDS.AVATAR);

export const uploadPropertyImagesMiddleware = imageUploader.array(
  RequestConfig.UPLOAD.FIELDS.PROPERTY_IMAGES,
  RequestConfig.UPLOAD.MAX_PROPERTY_IMAGES,
);

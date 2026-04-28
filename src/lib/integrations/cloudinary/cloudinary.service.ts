import { type UploadApiOptions, v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

import { provide } from '@ioc/decorators.js';
import { appConfig } from '@lib/configs/app.config.js';
import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { HttpError } from '@lib/errors/http.error.js';
import { logger } from '@lib/logger.js';

import { CloudinaryConfig } from './cloudinary.constants.js';
import type { CloudinaryUploadParams, CloudinaryUploadResult } from './cloudinary.types.js';

@provide()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: appConfig.CLOUDINARY_CLOUD_NAME,
      api_key: appConfig.CLOUDINARY_API_KEY,
      api_secret: appConfig.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Uploads a file buffer to Cloudinary using a Node.js Readable stream.
   *
   * Automatically converts the image to the globally configured format and applies
   * intelligent quality compression. The file is stored under a dynamic base folder.
   *
   * @param {CloudinaryUploadParams} params - The upload configuration object.
   * @returns {Promise<CloudinaryUploadResult>} A Promise resolving to the secure URL and Public ID of the uploaded image.
   * @throws {HttpError} Will throw an HTTP 502 error if the Cloudinary API rejects the stream.
   */
  public async uploadImage(params: CloudinaryUploadParams): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const { fileBuffer, targetFolder, customPublicId } = params;

      const fullFolderPath = `${appConfig.CLOUDINARY_BASE_FOLDER}/${targetFolder}`;

      const uploadOptions: UploadApiOptions = {
        folder: fullFolderPath,
        format: CloudinaryConfig.FORMAT,
        transformation: [{ quality: CloudinaryConfig.QUALITY }],
      };

      if (customPublicId) {
        uploadOptions.public_id = customPublicId;
      }

      const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error || !result) {
          const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
          logger.error(
            `[CloudinaryService] Failed to upload image to ${fullFolderPath}: ${errorMessage || 'Unknown error'}`,
          );

          return reject(
            new HttpError({
              statusCode: 502,
              message: ErrorMessages.INTEGRATION.CLOUD_STORAGE,
              internalPayload: { code: ErrorCodes.INTEGRATION.CLOUD_STORAGE },
            }),
          );
        }

        logger.info(`[CloudinaryService] Image successfully uploaded: ${result.public_id}`);

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      });

      Readable.from(fileBuffer).pipe(uploadStream);
    });
  }

  /**
   * Deletes an asset from the Cloudinary database.
   *
   * This is critical for preventing orphaned files in the cloud storage
   * when entities are updated or deleted.
   *
   * @param {string} publicId - The unique Cloudinary identifier of the image to delete.
   * @returns {Promise<void>} Resolves when the image is successfully destroyed.
   * @throws {HttpError} Will throw an HTTP 502 error if the deletion process fails.
   */
  public async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      logger.info(`[CloudinaryService] Deleted image: ${publicId}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      logger.error(
        `[CloudinaryService] Failed to delete image ${publicId}: ${errorMessage || 'Unknown error'}`,
      );

      throw new HttpError({
        statusCode: 502,
        message: ErrorMessages.INTEGRATION.CLOUD_STORAGE,
        internalPayload: { code: ErrorCodes.INTEGRATION.CLOUD_STORAGE },
      });
    }
  }
}

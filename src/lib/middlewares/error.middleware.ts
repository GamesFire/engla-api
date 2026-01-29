import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';

import type {
  ErrorResponse,
  LogPayload,
  ValidationErrorDetail,
} from '@app/interfaces/errors.interface.js';
import { appConfig } from '@lib/configs/app.config.js';
import { LogLevel } from '@lib/constants/app.js';
import { ErrorCode, ErrorMessage } from '@lib/constants/error-codes.js';
import { HttpError } from '@lib/errors/http.error.js';
import { logger } from '@lib/logger.js';
import { generateTraceID } from '@utils/data.js';
import { isBodyParserError } from '@utils/type-guards/is-body-parser-error.js';

export const errorMiddleware: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const traceID = req.traceID || generateTraceID();

  let statusCode = 500;
  let message: string = ErrorMessage.INTERNAL_SERVER_ERROR;
  let errorCode: string = ErrorCode.INTERNAL_ERROR;
  let validationErrors: Undefinable<ValidationErrorDetail[]> = undefined;

  let internalDetails: Record<string, unknown> = {};

  if (err instanceof HttpError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = `HTTP_${err.statusCode}`;
    internalDetails = {
      internalPayload: err.internalPayload,
      originalError: err.originalError,
    };
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = ErrorMessage.VALIDATION_FAILED;
    errorCode = ErrorCode.VALIDATION_ERROR;
    validationErrors = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    internalDetails = { validationRaw: err.issues };
  } else if (err instanceof multer.MulterError) {
    statusCode = 400;
    errorCode = ErrorCode.UPLOAD_ERROR;

    switch (err.code) {
      case 'LIMIT_FILE_SIZE': {
        message = ErrorMessage.FILE_TOO_LARGE;
        statusCode = 413;
        break;
      }
      case 'LIMIT_FILE_COUNT': {
        message = ErrorMessage.TOO_MANY_FILES;
        break;
      }
      case 'LIMIT_UNEXPECTED_FILE': {
        message = ErrorMessage.UNEXPECTED_FILE;
        break;
      }
      default: {
        message = `${ErrorMessage.GENERIC_UPLOAD_ERROR}: ${err.message}`;
      }
    }
  } else if (isBodyParserError(err)) {
    statusCode = 400;
    message = ErrorMessage.JSON_INVALID;
    errorCode = ErrorCode.JSON_PARSE_ERROR;
  } else if (err instanceof Error) {
    internalDetails = {
      stack: err.stack,
      rawMessage: err.message,
      name: err.name,
    };

    if (appConfig.isProd) {
      message = ErrorMessage.GENERIC_PROD_ERROR;
    } else {
      message = err.message;
    }
  }

  const logPayload: LogPayload = {
    url: req.url,
    method: req.method,
    ip: req.ip,
    traceID,
    statusCode,
    errorMessage: message, // The message sent to the client
    ...internalDetails, // Technical details (stack, internalPayload)
  };

  const logLevel = statusCode >= 500 ? LogLevel.ERROR : LogLevel.WARN;

  logger.log(logLevel, `[API Error] ${message}`, logPayload);

  const response: ErrorResponse = {
    status: 'error',
    message,
    code: errorCode,
    traceID,
  };

  if (validationErrors) {
    response.validation = validationErrors;
  }

  if (appConfig.isDev && statusCode >= 500 && err instanceof Error) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

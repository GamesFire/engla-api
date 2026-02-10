export interface ValidationErrorDetail {
  path: string;
  message: string;
}

export interface ErrorResponse {
  status: 'error';
  message: string;
  traceID: string;
  code: string;
  validation?: ValidationErrorDetail[];
  stack?: string; // Only for Dev
}

/**
 * Interface for logs.
 */
export interface LogPayload extends Record<string, unknown> {
  url: string;
  method: string;
  ip?: string;
  traceID: string;
  statusCode: number;
  errorMessage: string;
}

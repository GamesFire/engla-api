export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly internalPayload?: Record<string, unknown>;
  public readonly originalError?: Unknowable<Error>;

  constructor(args: {
    message: string;
    statusCode: number;
    internalPayload?: Record<string, unknown>;
    originalError?: Unknowable<Error>;
  }) {
    super(args.message);
    this.statusCode = args.statusCode;
    this.internalPayload = args.internalPayload;
    this.originalError = args.originalError;
    this.name = 'HttpError';

    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

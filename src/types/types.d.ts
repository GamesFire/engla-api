declare global {
  type Nullable<T> = T | null;
  type Undefinable<T> = T | undefined;

  type NumberORString = number | string;
  type StringORDate = string | Date;

  namespace Express {
    export interface Request {
      traceID?: string;
    }
  }
}

export {};

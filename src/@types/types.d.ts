declare global {
  type Nullable<T> = T | null;
  type Undefinable<T> = T | undefined;
  type Unknowable<T> = T | unknown;

  type NumberORString = number | string;
  type StringORDate = string | Date;

  type WithNullable<T, K extends keyof T> = T & {
    [P in K]: Nullable<T[P]>;
  };
  type WithNonNullable<T, K extends keyof T> = T & {
    [P in K]: NonNullable<T[P]>;
  };
  type WithUndefinable<T, K extends keyof T> = T & {
    [P in K]: Undefinable<T[P]>;
  };
  type WithUnknowable<T, K extends keyof T> = T & {
    [P in K]: Unknowable<T[P]>;
  };

  namespace Express {
    export interface Request {
      traceID: string;
      log: import('winston').Logger;
      startTime: [number, number]; // process.hrtime tuple
      rawBody?: string;
      currentUser?: import('@models/users/user.model.js').User;
    }
  }

  var ioc: import('inversify').Container;
}

export {};

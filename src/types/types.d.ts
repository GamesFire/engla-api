declare global {
  type Nullable<T> = T | null;
  type Undefinable<T> = T | undefined;
  type Unknowable<T> = T | unknown;

  type NumberORString = number | string;
  type StringORDate = string | Date;

  namespace Express {
    export interface Request {
      traceID: string;
      log: import('winston').Logger;
      startTime: [number, number]; // process.hrtime tuple
      rawBody?: string;
      currentUser?: import('@models/users/user.model.js').UserModel;
    }
  }

  var ioc: import('inversify').Container;
}

export {};

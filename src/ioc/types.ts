/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import type { Bind, BindWhenOnFluentSyntax } from 'inversify';

export type ProvideMetadata = {
  constraint: (bind: Bind, target: Function) => Unknowable<BindWhenOnFluentSyntax<unknown>>;
  implementationType: Function;
};

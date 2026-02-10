/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import type { Bind, BindWhenOnFluentSyntax } from 'inversify';

export type TProvide = {
  constraint: (bind: Bind, target: Function) => Unknowable<BindWhenOnFluentSyntax<unknown>>;
  implementationType: Function;
};

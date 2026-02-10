import { type Bind, type BindWhenOnFluentSyntax, ContainerModule } from 'inversify';

import { REFLECT_KEYS } from './constants.js';
import type { TProvide } from './types.js';

export function buildProviderModule(): ContainerModule {
  return new ContainerModule(({ bind }) => {
    const provideMetadata: TProvide[] = Reflect.getMetadata(REFLECT_KEYS.PROVIDE, Reflect) || [];

    provideMetadata.forEach((metadata) => resolve(metadata, bind));
  });
}

function resolve(metadata: TProvide, bind: Bind): Unknowable<BindWhenOnFluentSyntax<unknown>> {
  return metadata.constraint(bind, metadata.implementationType);
}

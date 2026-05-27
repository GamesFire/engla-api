import { type Bind, type BindWhenOnFluentSyntax, ContainerModule } from 'inversify';

import { ReflectKey } from './constants.js';
import type { ProvideMetadata } from './types.js';

export function buildProviderModule(): ContainerModule {
  return new ContainerModule(({ bind }) => {
    const provideMetadata: ProvideMetadata[] =
      Reflect.getMetadata(ReflectKey.PROVIDE, Reflect) || [];

    provideMetadata.forEach((metadata) => resolve(metadata, bind));
  });
}

function resolve(
  metadata: ProvideMetadata,
  bind: Bind,
): Unknowable<BindWhenOnFluentSyntax<unknown>> {
  return metadata.constraint(bind, metadata.implementationType);
}

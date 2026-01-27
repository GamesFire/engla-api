import knex, { type Knex } from 'knex';
import { Model } from 'objection';

import { knexConfig } from '../configs/knex.config.js';

let __client: Nullable<Knex> = null;

export function getKnexClient(): Knex {
  if (!__client) {
    __client = knex(knexConfig);

    Model.knex(__client);
  }

  return __client;
}

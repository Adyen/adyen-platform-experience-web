import { EMPTY_ARRAY } from '../value/constants';

export const ALREADY_RESOLVED_PROMISE = Promise.resolve();
export const FOREVER_PENDING_PROMISE = Promise.race(EMPTY_ARRAY);

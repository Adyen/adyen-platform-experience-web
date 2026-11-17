import { Schema } from '../utils';
import { components } from '../resources/AccountsResourceV1';

/** The account of the session: an account holder or a balance account. */
export type ISessionAccount = Schema<components, 'Account'>;

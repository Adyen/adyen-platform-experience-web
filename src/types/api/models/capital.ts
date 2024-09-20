import { Schema } from '../utils';
import { components } from '../resources/CapitalResource';

export type IGrant = Schema<components, 'grantOfferDTO'>;
export type IDynamicOfferConfig = Schema<components, 'configuration'>;

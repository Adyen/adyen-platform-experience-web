import { Schema } from '../utils';
import { components } from '../resources/CapitalResource';

export type IGrant = Schema<components, 'GrantDTO'>;
export type IDynamicOfferConfig = Schema<components, 'DynamicOffersResponseDTO'>;

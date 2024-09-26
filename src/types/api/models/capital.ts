import { Schema } from '../utils';
import { components } from '../resources/CapitalResource';

export type IGrant = Schema<components, 'GrantOfferResponseDTO'>;
export type IDynamicOfferConfig = Schema<components, 'DynamicOffersResponseDTO'>;

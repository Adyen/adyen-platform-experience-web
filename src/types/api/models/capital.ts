import { Schema } from '../utils';
import { components } from '../resources/CapitalResource';

export type IGrant = Schema<components, 'GrantDTO'>;
export type IGrantStatus = Schema<components, 'GrantStatus'>;
export type IDynamicOfferConfig = Schema<components, 'DynamicOffersResponseDTO'>;
export type IGrantOfferResponseDTO = Schema<components, 'GrantOfferResponseDTO'>;

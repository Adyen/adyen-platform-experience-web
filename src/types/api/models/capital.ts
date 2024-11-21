import { Schema } from '../utils';
import { components } from '../resources/CapitalResource';

export type IDynamicOfferConfig = Schema<components, 'DynamicOffersResponseDTO'>;
export type IGrant = Schema<components, 'GrantResponseDTO'>;
export type IGrantOfferResponseDTO = Schema<components, 'GrantOfferResponseDTO'>;
export type IGrantStatus = Schema<components, 'GrantStatus'>;
export type IMissingAction = Schema<components, 'MissingActionDTO'>;

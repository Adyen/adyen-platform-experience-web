import { Schema } from '../utils';
import { components as CapitalResourceComponents } from '../resources/CapitalGrantOffersResource';
import { components as CapitalGrantsResourceComponents } from '../resources/CapitalGrantsResource';

export type IDynamicOffersConfig = Schema<CapitalResourceComponents, 'DynamicOffersResponseDTO'>;
export type IGrant = Schema<CapitalGrantsResourceComponents, 'GrantResponseDTO'>;
export type INLCapitalFundsCollection = Schema<CapitalGrantsResourceComponents, 'NLCapitalFundsCollection'>;
export type IUSCapitalFundsCollection = Schema<CapitalGrantsResourceComponents, 'USCapitalFundsCollection'>;
export type IGBCapitalFundsCollection = Schema<CapitalGrantsResourceComponents, 'GBCapitalFundsCollection'>;
export type IGrantOfferResponseDTO = Schema<CapitalResourceComponents, 'GrantOfferResponseDTO'>;
export type IGrantStatus = Schema<CapitalGrantsResourceComponents, 'GrantStatus'>;
export type IMissingAction = Schema<CapitalGrantsResourceComponents, 'MissingActionDTO'>;

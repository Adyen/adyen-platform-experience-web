import { Schema } from '../utils';
import { components as capitalGrantOffersComponents } from '../resources/CapitalGrantOffersResourceV1';
import { components as capitalGrantsComponents } from '../resources/CapitalGrantsResourceV1';
import { components as onboardingConfigurationComponents } from '../resources/OnboardingConfigurationResourceV1';

export type IDynamicOffersConfig = Schema<capitalGrantOffersComponents, 'DynamicOffersResponseDTO'>;
export type IGrant = Schema<capitalGrantsComponents, 'GrantResponseDTO'>;
export type INLCapitalFundsCollection = Schema<capitalGrantsComponents, 'NLCapitalFundsCollection'>;
export type IUSCapitalFundsCollection = Schema<capitalGrantsComponents, 'USCapitalFundsCollection'>;
export type IGBCapitalFundsCollection = Schema<capitalGrantsComponents, 'GBCapitalFundsCollection'>;
export type IGrantOfferResponseDTO = Schema<capitalGrantOffersComponents, 'GrantOfferResponseDTO'>;
export type IGrantStatus = Schema<capitalGrantsComponents, 'GrantStatus'>;
export type IMissingAction = Schema<capitalGrantsComponents, 'MissingActionDTO'>;
export type IMissingActionType = Schema<capitalGrantsComponents, 'MissingActionType'>;
export type IOnboardingConfiguration = Schema<onboardingConfigurationComponents, 'OnboardingConfigurationResponseDTO'>;

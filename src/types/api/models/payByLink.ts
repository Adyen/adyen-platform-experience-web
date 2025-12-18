import { components } from '../resources/PayByLinkResource';
import { Schema } from '../utils';

export type PaymentLinkConfiguration = Schema<components, 'ConfigurationResponse'>;
export type PaymentLinkConfigurationElement =
    | Schema<components, 'FieldRequirementLinkType'>
    | Schema<components, 'FieldRequirementLinkValidity'>
    | Schema<components, 'FieldRequirementString'>
    | Schema<components, 'FieldRequirementVoid'>;
export type CreatePaymentLinkRequestDTO = Schema<components, 'CreatePaymentLinkRequestDTO'>;
export type LinkValidityDTO = Schema<components, 'LinkValidity'>;
export type PaymentLinkTypeDTO = Schema<components, 'PaymentLinkType'>;
export type PayByLinkStoreDTO = Schema<components, 'PayByLinkStoreDTO'>;
export type IPayByLinkList = Schema<components, 'PaymentLinksResponse'>;
export type IPaymentLinkItem = Schema<components, 'PaymentLinksItem'>;
export type IPayByLinkFilters = Schema<components, 'FiltersResponseDTO'>;
export type IPayByLinkStatus = Schema<components, 'PayByLinkStatus'>;
export type IPayByLinkType = Schema<components, 'PaymentLinkType'>;
export type IPayByLinkStatusGroup = keyof Schema<components, 'PaymentLinkStatuses'>;
export type IPayByLinkFilterStatusGroup = Schema<components, 'FiltersResponseDTO'>['statuses'];
export type PaymentLinkCurrencyDTO = Schema<components, 'CurrenciesResponseDTO'>['data'];
export type PaymentLinkCountryDTO = Schema<components, 'CountriesResponseDTO'>['data'][number];

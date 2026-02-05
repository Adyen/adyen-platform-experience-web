import { components } from '../resources/PayByLinkResource';
import { Schema } from '../utils';

export type IPaymentLinkActivity = Schema<components, 'PaymentLinkActivity'>;
export type IPaymentLinkConfiguration = Schema<components, 'ConfigurationResponse'>;
export type IPaymentLinkConfigurationElement =
    | Schema<components, 'FieldRequirementLinkType'>
    | Schema<components, 'FieldRequirementLinkValidity'>
    | Schema<components, 'FieldRequirementString'>
    | Schema<components, 'FieldRequirementVoid'>;
export type IPaymentLinkCreateRequest = Schema<components, 'CreatePaymentLinkRequestDTO'>;
export type IPaymentLinkDetails = Schema<components, 'PaymentLinkDetails'>;
export type IPaymentLinkStore = Schema<components, 'PayByLinkStoreDTO'>;
export type IPaymentLinkStatus = Schema<components, 'PayByLinkStatus'>;
export type IPaymentLinkCountry = Schema<components, 'CountryDTO'>;
export type IPaymentLinkCurrency = Schema<components, 'CurrenciesResponseDTO'>['data'];
export type IPaymentLinkFilters = Schema<components, 'FiltersResponseDTO'>;
export type IPaymentLinkFilterStatusGroup = Schema<components, 'FiltersResponseDTO'>['statuses'];
export type IPaymentLinkItem = Schema<components, 'PaymentLinksItem'>;
export type IPaymentLinkSettings = Schema<components, 'PayByLinkSettingsResponse'>;
export type IPaymentLinkStatusGroup = keyof Schema<components, 'PaymentLinkStatuses'>;
export type IPaymentLinkTermsAndConditions = Schema<components, 'PayByLinkSettingsResponse'>;
export type IPaymentLinkTheme = Schema<components, 'ThemeDTO'>;
export type IPaymentLinkType = Schema<components, 'PaymentLinkType'>;
export type IPaymentLinkValidity = Schema<components, 'LinkValidity'>;
export type IPaymentLinkShopperAddress = Schema<components, 'address'>;
export type IShopperInformation = Schema<components, 'ShopperInformation'>;

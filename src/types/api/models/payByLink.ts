import { Schema } from '../utils';
import { components } from '../resources/PayByLinkResource';

export type IPayByLinkList = Schema<components, 'PaymentLinksResponse'>;

export type IPaymentLinkItem = Schema<components, 'PaymentLinksItem'>;

export type IPayByLinkFilters = Schema<components, 'FiltersResponseDTO'>;

export type IPayByLinkStatus = Schema<components, 'PayByLinkStatus'>;

export type IPayByLinkType = Schema<components, 'PaymentLinkType'>;
export type IPayByLinkStatusGroup = keyof Schema<components, 'PaymentLinkStatuses'>;
export type IPayByLinkFilterStatusGroup = Schema<components, 'FiltersResponseDTO'>['statuses'];
export type IPayByLinkTermsAndConditions = Schema<components, 'PayByLinkSettingsResponse'>;
export type IPayByLinkTheme = Schema<components, 'ThemeDTO'>;
export type IStore = Schema<components, 'PayByLinkStoreDTO'>;

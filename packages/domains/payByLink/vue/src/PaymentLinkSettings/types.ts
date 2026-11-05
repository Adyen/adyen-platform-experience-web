import type { UIElementProps } from '@integration-components/core/vue';
import type { IPaymentLinkTermsAndConditions } from '@integration-components/types';
import type { PaymentLinkSettingsItem, PaymentLinkSettingsProps } from '../../../domain/src';

export type {
    LogoType,
    MenuItemType,
    PaymentLinkSettingsData,
    PaymentLinkSettingsItem,
    PaymentLinkSettingsMenuItem,
    PaymentLinkSettingsPayload,
    SettingsErrorContent,
    StoreItem,
    ThemeFormData,
} from '../../../domain/src';

export type PaymentLinkSettingsExternalProps = UIElementProps & PaymentLinkSettingsProps;

export type PaymentLinkSettingsNavigateBack = (savedTermsAndConditions?: IPaymentLinkTermsAndConditions) => void;

export type PaymentLinkSettingsComponentProps = Omit<PaymentLinkSettingsExternalProps, 'core' | 'appearance'> & {
    embeddedInOverview?: boolean;
    hideTitle?: boolean;
    navigateBack?: PaymentLinkSettingsNavigateBack;
    onContactSupport?: () => void;
    settingsItems?: PaymentLinkSettingsItem[];
};

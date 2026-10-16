import type { UIElementProps } from '@integration-components/core/vue';
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

export type PaymentLinkSettingsComponentProps = Omit<PaymentLinkSettingsExternalProps, 'core' | 'appearance'> & {
    embeddedInOverview?: boolean;
    hideTitle?: boolean;
    onContactSupport?: () => void;
    settingsItems?: PaymentLinkSettingsItem[];
};

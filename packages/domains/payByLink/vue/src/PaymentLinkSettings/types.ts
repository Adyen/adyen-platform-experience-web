import type { CoreInstance } from '@integration-components/core/vue';
import type { PaymentLinkSettingsProps } from '../../../domain/src';

export type {
    LogoType,
    MenuItemType,
    PaymentLinkSettingsData,
    PaymentLinkSettingsItem,
    PaymentLinkSettingsMenuItem,
    PaymentLinkSettingsPayload,
    PaymentLinkSettingsProps,
    SettingsErrorContent,
    StoreItem,
    ThemeFormData,
} from '../../../domain/src';

export interface PaymentLinkSettingsExternalProps extends PaymentLinkSettingsProps {
    core: CoreInstance;
}

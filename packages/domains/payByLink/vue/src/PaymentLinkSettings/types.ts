import type { CoreInstance } from '@integration-components/core/vue';
import type { PaymentLinkSettingsProps } from '@integration-components/payByLink/domain';

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
} from '@integration-components/payByLink/domain';

export interface PaymentLinkSettingsExternalProps extends PaymentLinkSettingsProps {
    core: CoreInstance;
}

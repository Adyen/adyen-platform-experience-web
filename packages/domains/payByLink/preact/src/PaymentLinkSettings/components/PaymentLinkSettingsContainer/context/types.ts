import type { Dispatch } from 'preact/compat';
import { StateUpdater } from 'preact/hooks';
import { SecondaryNavItem } from '@integration-components/ui-components-preact/SecondaryNav';
import { AdyenPlatformExperienceError } from '@integration-components/core';
import type {
    MenuItemType,
    PaymentLinkSettingsData,
    PaymentLinkSettingsItem,
    PaymentLinkSettingsMenuItem,
    PaymentLinkSettingsPayload,
    StoreItem,
    ThemeFormData,
} from '@integration-components/payByLink/domain';

export type {
    MenuItemType,
    PaymentLinkSettingsData,
    PaymentLinkSettingsItem,
    PaymentLinkSettingsMenuItem,
    PaymentLinkSettingsPayload,
    StoreItem,
    ThemeFormData,
};

export interface IPaymentLinkSettingsContext {
    isLoadingContent: boolean;
    isLoadingStores: boolean;
    storesError: AdyenPlatformExperienceError | undefined;
    termsAndConditionsError: AdyenPlatformExperienceError | undefined;
    themeError: AdyenPlatformExperienceError | undefined;
    menuItems: MenuItemType[] | undefined;
    payload: PaymentLinkSettingsPayload;
    activeMenuItem: PaymentLinkSettingsItem | null;
    setPayload: (payload: PaymentLinkSettingsPayload) => void;
    saveActionCalled: boolean | undefined;
    setSelectedMenuItem: (item: SecondaryNavItem<PaymentLinkSettingsItem>) => void;
    selectedStore: string | undefined;
    setIsValid: (validity: boolean) => void;
    getIsValid: () => boolean;
    setSaveActionCalled: Dispatch<StateUpdater<boolean | undefined>>;
    filteredStores: StoreItem[] | undefined;
    allStores: StoreItem[] | undefined;
    setSelectedStore: Dispatch<StateUpdater<string | undefined>>;
    setSavedData: (data: PaymentLinkSettingsData) => void;
    savedData: PaymentLinkSettingsData;
    isSaving: boolean | undefined;
    isSaveError: boolean | undefined;
    isSaveSuccess: boolean | undefined;
    isShowingRequirements: boolean;
    onSave: () => void;
    setIsSaveError: Dispatch<StateUpdater<boolean>>;
    setIsSaveSuccess: Dispatch<StateUpdater<boolean>>;
    setIsShowingRequirements: Dispatch<StateUpdater<boolean>>;
    embeddedInOverview?: boolean;
}

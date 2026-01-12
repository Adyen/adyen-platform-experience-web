import type { Dispatch } from 'preact/compat';
import { StateUpdater } from 'preact/hooks';
import { StoreSelectorItemParams } from '../../../../../../internal/StoreSelector/types';
import { IPaymentLinkTermsAndConditions } from '../../../../../../../types';
import { SecondaryNavItem } from '../../../../../../internal/SecondaryNav';
import { TranslationKey } from '../../../../../../../translations';
import AdyenPlatformExperienceError from '../../../../../../../core/Errors/AdyenPlatformExperienceError';

export type PaymentLinkSettingsPayload = FormData | IPaymentLinkTermsAndConditions | undefined;
export type ThemeFormData = {
    logo?: string | undefined;
    fullWidthLogo?: string | undefined;
    brandName?: string | undefined;
};
export type PaymentLinkSettingsData = IPaymentLinkTermsAndConditions | ThemeFormData | undefined;
export type PaymentLinkSettingsItem = 'theme' | 'termsAndConditions';
export type PaymentLinkSettingsMenuItem = { value: PaymentLinkSettingsItem; label: TranslationKey };
export type MenuItemType = { value: PaymentLinkSettingsItem; label: string };

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
    filteredStores: StoreSelectorItemParams[] | undefined;
    allStores: StoreSelectorItemParams[] | undefined;
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

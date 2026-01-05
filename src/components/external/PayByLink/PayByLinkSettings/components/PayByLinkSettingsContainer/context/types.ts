import type { Dispatch } from 'preact/compat';
import { StateUpdater } from 'preact/hooks';
import { StoreSelectorItemParams } from '../../../../../../internal/StoreSelector/types';
import { IPayByLinkTermsAndConditions } from '../../../../../../../types';
import { SecondaryNavItem } from '../../../../../../internal/SecondaryNav';
import { TranslationKey } from '../../../../../../../translations';
import AdyenPlatformExperienceError from '../../../../../../../core/Errors/AdyenPlatformExperienceError';

export type PayByLinkSettingsPayload = FormData | IPayByLinkTermsAndConditions | undefined;
export type ThemeFormData = {
    logo?: string | undefined;
    fullWidthLogo?: string | undefined;
    brandName?: string | undefined;
};
export type PayByLinkSettingsData = IPayByLinkTermsAndConditions | ThemeFormData | undefined;
export type PayByLinkSettingsItem = 'theme' | 'termsAndConditions';
export type PayByLinkSettingsMenuItem = { value: PayByLinkSettingsItem; label: TranslationKey };
export type MenuItemType = { value: PayByLinkSettingsItem; label: string };

export interface IPayByLinkSettingsContext {
    isLoadingContent: boolean;
    isLoadingStores: boolean;
    storesError: AdyenPlatformExperienceError | undefined;
    termsAndConditionsError: AdyenPlatformExperienceError | undefined;
    themeError: AdyenPlatformExperienceError | undefined;
    menuItems: MenuItemType[] | undefined;
    payload: PayByLinkSettingsPayload;
    activeMenuItem: PayByLinkSettingsItem | null;
    setPayload: (payload: PayByLinkSettingsPayload) => void;
    saveActionCalled: boolean | undefined;
    setSelectedMenuItem: (item: SecondaryNavItem<PayByLinkSettingsItem>) => void;
    selectedStore: string | undefined;
    setIsValid: (validity: boolean) => void;
    getIsValid: () => boolean;
    setSaveActionCalled: Dispatch<StateUpdater<boolean | undefined>>;
    filteredStores: StoreSelectorItemParams[] | undefined;
    allStores: StoreSelectorItemParams[] | undefined;
    setSelectedStore: Dispatch<StateUpdater<string | undefined>>;
    setSavedData: (data: PayByLinkSettingsData) => void;
    savedData: PayByLinkSettingsData;
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

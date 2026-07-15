import { computed, inject, provide, ref, watch, type ComputedRef, type InjectionKey, type Ref } from 'vue';
import { useResponsiveContainer, containerQueries } from '@integration-components/composables-vue';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import type { StoreIds } from '@integration-components/payByLink/domain';
import { MenuItem } from '../constants';
import type { MenuItemType, PaymentLinkSettingsData, PaymentLinkSettingsItem, PaymentLinkSettingsPayload, StoreItem } from '../types';
import { useSettingsPermission } from './useSettingsPermission';
import { useStores } from './useStores';
import { useStoreTheme } from './useStoreTheme';
import { useStoreTermsAndConditions } from './useStoreTermsAndConditions';
import { useSaveAction } from './useSaveAction';

export interface PaymentLinkSettingsContextValue {
    isLoadingContent: ComputedRef<boolean>;
    isLoadingStores: Ref<boolean>;
    storesError: Ref<AdyenPlatformExperienceError | undefined>;
    termsAndConditionsError: Ref<AdyenPlatformExperienceError | undefined>;
    themeError: Ref<AdyenPlatformExperienceError | undefined>;
    menuItems: MenuItemType[];
    payload: Ref<PaymentLinkSettingsPayload>;
    activeMenuItem: Ref<PaymentLinkSettingsItem | null>;
    setPayload: (payload: PaymentLinkSettingsPayload) => void;
    saveActionCalled: Ref<boolean>;
    setSaveActionCalled: (value: boolean) => void;
    setSelectedMenuItem: (value: PaymentLinkSettingsItem) => void;
    selectedStore: Ref<string | undefined>;
    setSelectedStore: (id: string | undefined) => void;
    setIsValid: (validity: boolean) => void;
    getIsValid: () => boolean;
    filteredStores: ComputedRef<StoreItem[] | undefined>;
    allStores: ComputedRef<StoreItem[] | undefined>;
    savedData: Ref<PaymentLinkSettingsData>;
    setSavedData: (data: PaymentLinkSettingsData) => void;
    isSaving: Ref<boolean>;
    isSaveError: Ref<boolean>;
    isSaveSuccess: Ref<boolean>;
    setIsSaveError: (value: boolean) => void;
    setIsSaveSuccess: (value: boolean) => void;
    isShowingRequirements: Ref<boolean>;
    setIsShowingRequirements: (value: boolean) => void;
    onSave: () => void;
    embeddedInOverview?: boolean;
    navigateBack?: () => void;
}

const PAYMENT_LINK_SETTINGS_CONTEXT: InjectionKey<PaymentLinkSettingsContextValue> = Symbol('PaymentLinkSettingsContext');

export interface ProvidePaymentLinkSettingsOptions {
    selectedMenuItems: MenuItemType[];
    storeIds?: StoreIds;
    embeddedInOverview?: boolean;
    navigateBack?: () => void;
}

export function providePaymentLinkSettings(options: ProvidePaymentLinkSettingsOptions): PaymentLinkSettingsContextValue {
    const { selectedMenuItems: menuItems, storeIds, embeddedInOverview, navigateBack } = options;

    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
    const { themeEnabled, termsAndConditionsEnabled } = useSettingsPermission();

    const menuItemPreSelect = computed<PaymentLinkSettingsItem | undefined>(() => {
        if (isSmContainer.value && menuItems.length > 1) return undefined;
        return menuItems.length > 0 && menuItems[0] ? menuItems[0].value : undefined;
    });

    const activeMenuItem = ref<PaymentLinkSettingsItem | null>(null);
    const payload = ref<PaymentLinkSettingsPayload>(undefined) as Ref<PaymentLinkSettingsPayload>;
    const savedData = ref<PaymentLinkSettingsData>(undefined) as Ref<PaymentLinkSettingsData>;
    const isValid = ref(false);
    const saveActionCalled = ref(false);
    const isSaving = ref(false);
    const isSaveError = ref(false);
    const isSaveSuccess = ref(false);
    const isShowingRequirements = ref(false);
    const loading = ref(false);

    watch(
        menuItemPreSelect,
        value => {
            if (value) activeMenuItem.value = value;
        },
        { immediate: true }
    );

    const { filteredStores, selectedStore, setSelectedStore, isFetching: isLoadingStores, error: storesError, allStores } = useStores(storeIds);

    const getIsValid = () => isValid.value;
    const setIsValid = (validity: boolean) => {
        isValid.value = validity;
    };

    const setPayload = (value: PaymentLinkSettingsPayload) => {
        if (value !== undefined) payload.value = value;
    };
    const setSavedData = (data: PaymentLinkSettingsData) => {
        savedData.value = data;
    };
    const setIsSaveError = (value: boolean) => {
        isSaveError.value = value;
    };
    const setIsSaveSuccess = (value: boolean) => {
        isSaveSuccess.value = value;
    };
    const setSaveActionCalled = (value: boolean) => {
        saveActionCalled.value = value;
    };
    const setIsSaving = (value: boolean) => {
        isSaving.value = value;
    };
    const setIsShowingRequirements = (value: boolean) => {
        isShowingRequirements.value = value;
    };

    const { onSave } = useSaveAction({
        selectedStore,
        payload,
        activeMenuItem,
        getIsValid,
        setIsSaving,
        setIsSaveError,
        setIsSaveSuccess,
        setSaveActionCalled,
        setSavedData,
        setPayload,
        navigateBack,
    });

    const themeFetchEnabled = computed(() => activeMenuItem.value === MenuItem.theme);
    const termsAndConditionsFetchEnabled = computed(() => activeMenuItem.value === MenuItem.termsAndConditions);

    const { theme, isFetching: loadingThemes, error: themeError } = useStoreTheme(selectedStore, themeFetchEnabled);
    const {
        data: termsAndConditions,
        isFetching: loadingTermsAndConditions,
        error: termsAndConditionsError,
    } = useStoreTermsAndConditions(selectedStore, termsAndConditionsFetchEnabled);

    watch(
        [activeMenuItem, selectedStore],
        () => {
            isSaving.value = false;
            isSaveError.value = false;
            isSaveSuccess.value = false;
            saveActionCalled.value = false;
            savedData.value = undefined;
            payload.value = undefined;
            if (activeMenuItem.value) loading.value = true;
        },
        { immediate: true }
    );

    watch([themeFetchEnabled, theme, loadingThemes], () => {
        if (themeFetchEnabled.value) {
            if (!loadingThemes.value) {
                savedData.value = theme.value;
                payload.value = undefined;
                loading.value = false;
            }
        }
    });

    watch([termsAndConditionsFetchEnabled, termsAndConditions, loadingTermsAndConditions], () => {
        if (termsAndConditionsFetchEnabled.value) {
            if (!loadingTermsAndConditions.value) {
                savedData.value = termsAndConditions.value;
                payload.value = undefined;
                loading.value = false;
            }
        }
    });

    watch([themeError, termsAndConditionsError], () => {
        if (themeError.value || termsAndConditionsError.value) loading.value = false;
    });

    watch(
        [filteredStores, selectedStore],
        () => {
            if (!selectedStore.value && filteredStores.value && filteredStores.value.length > 0) {
                setSelectedStore(filteredStores.value[0]?.id);
            }
        },
        { immediate: true }
    );

    const hasPermission = computed(() => {
        if (!activeMenuItem.value) return false;
        return activeMenuItem.value === MenuItem.theme ? themeEnabled.value : termsAndConditionsEnabled.value;
    });

    const isLoadingContent = computed(() => {
        if (!hasPermission.value) return false;
        return loading.value || loadingThemes.value || loadingTermsAndConditions.value || isLoadingStores.value;
    });

    const setSelectedMenuItem = (value: PaymentLinkSettingsItem) => {
        if (activeMenuItem.value !== value) {
            loading.value = true;
            activeMenuItem.value = value;
        }
    };

    const context: PaymentLinkSettingsContextValue = {
        isLoadingContent,
        isLoadingStores,
        storesError,
        termsAndConditionsError,
        themeError,
        menuItems,
        payload,
        activeMenuItem,
        setPayload,
        saveActionCalled,
        setSaveActionCalled,
        setSelectedMenuItem,
        selectedStore,
        setSelectedStore,
        setIsValid,
        getIsValid,
        filteredStores,
        allStores,
        savedData,
        setSavedData,
        isSaving,
        isSaveError,
        isSaveSuccess,
        setIsSaveError,
        setIsSaveSuccess,
        isShowingRequirements,
        setIsShowingRequirements,
        onSave,
        embeddedInOverview,
        navigateBack,
    };

    provide(PAYMENT_LINK_SETTINGS_CONTEXT, context);

    return context;
}

export function usePaymentLinkSettingsContext(): PaymentLinkSettingsContextValue {
    const context = inject(PAYMENT_LINK_SETTINGS_CONTEXT);
    if (!context) {
        throw new Error('usePaymentLinkSettingsContext must be used within a component tree that calls providePaymentLinkSettings');
    }
    return context;
}

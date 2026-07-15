import { onUnmounted, ref, type Ref } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { isFunction, isUndefined } from '@integration-components/utils';
import type { EndpointHttpCallables } from '@integration-components/core';
import { MenuItem } from '../constants';
import { isThemePayload } from '../utils/typeGuards';
import { getThemePayload } from '../utils/getThemePayload';
import type { PaymentLinkSettingsData, PaymentLinkSettingsItem, PaymentLinkSettingsPayload } from '../types';

type UpdatePayByLinkThemeRequest = Parameters<EndpointHttpCallables<'updatePayByLinkTheme'>>[0];
type SavePayByLinkSettingsRequest = Parameters<EndpointHttpCallables<'savePayByLinkSettings'>>[0];

export interface UseSaveActionParams {
    selectedStore: Ref<string | undefined>;
    payload: Ref<PaymentLinkSettingsPayload>;
    activeMenuItem: Ref<PaymentLinkSettingsItem | null>;
    getIsValid: () => boolean;
    setIsSaving: (value: boolean) => void;
    setIsSaveError: (value: boolean) => void;
    setIsSaveSuccess: (value: boolean) => void;
    setSaveActionCalled: (value: boolean) => void;
    setSavedData: (data: PaymentLinkSettingsData) => void;
    setPayload: (payload: PaymentLinkSettingsPayload) => void;
    navigateBack?: () => void;
}

export function useSaveAction({
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
}: UseSaveActionParams) {
    const { updatePayByLinkTheme, savePayByLinkSettings } = useConfigContext().endpoints;
    const navigationTimeout = ref<ReturnType<typeof setTimeout>>();

    onUnmounted(() => {
        if (navigationTimeout.value) clearTimeout(navigationTimeout.value);
    });

    const onSaveComplete = () => {
        if (navigateBack && isFunction(navigateBack)) {
            navigationTimeout.value = setTimeout(() => navigateBack(), 500);
        } else {
            setIsSaving(false);
        }
    };

    async function onSaveTheme() {
        const store = selectedStore.value;
        const currentPayload = payload.value;
        if (!store || isUndefined(currentPayload) || !getIsValid() || !isThemePayload(currentPayload)) return;
        if (!isFunction(updatePayByLinkTheme)) return;

        setIsSaving(true);
        try {
            const data = await updatePayByLinkTheme(
                { contentType: 'multipart/form-data', body: currentPayload as unknown as UpdatePayByLinkThemeRequest['body'] },
                { path: { storeId: store } }
            );
            const themeData = { brandName: data?.brandName, logo: data?.logoUrl, fullWidthLogo: data?.fullWidthLogoUrl };
            setSavedData(themeData);
            setPayload(getThemePayload(themeData));
            setIsSaveError(false);
            setIsSaveSuccess(true);
            setIsSaving(false);
        } catch {
            setIsSaveError(true);
            setIsSaveSuccess(false);
            setIsSaving(false);
        }
    }

    async function onSaveTermsAndConditions() {
        const store = selectedStore.value;
        const currentPayload = payload.value;
        if (!store || isUndefined(currentPayload) || !getIsValid() || isThemePayload(currentPayload)) return;
        if (!isFunction(savePayByLinkSettings)) return;

        setIsSaving(true);
        try {
            const data = await savePayByLinkSettings(
                { contentType: 'application/json', body: currentPayload as unknown as SavePayByLinkSettingsRequest['body'] },
                { path: { storeId: store } }
            );
            const savedData = !data || !data.termsOfServiceUrl ? { termsOfServiceUrl: '' } : data;
            setSavedData(savedData);
            setPayload(savedData);
            setIsSaveError(false);
            setIsSaveSuccess(true);
            onSaveComplete();
        } catch {
            setIsSaveError(true);
            setIsSaveSuccess(false);
            setIsSaving(false);
        }
    }

    function onSave() {
        const item = activeMenuItem.value;
        if (!item) return;
        setSaveActionCalled(true);
        if (item === MenuItem.theme) return onSaveTheme();
        if (item === MenuItem.termsAndConditions) return onSaveTermsAndConditions();
    }

    return { onSave };
}

export default useSaveAction;

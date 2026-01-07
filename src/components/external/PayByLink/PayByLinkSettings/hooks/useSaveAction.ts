import { useConfigContext } from '../../../../../core/ConfigContext';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { StateUpdater, useCallback, useEffect, useRef } from 'preact/hooks';
import { MenuItem } from '../components/PayByLinkSettingsContainer/context/constants';
import { isFunction, isUndefined } from '../../../../../utils';
import { PayByLinkSettingsData, PayByLinkSettingsItem, PayByLinkSettingsPayload } from '../components/PayByLinkSettingsContainer/context/types';
import { getThemePayload } from '../components/PayByLinkSettingsContainer/utils/getThemePayload';
import { Dispatch } from 'preact/compat';
import { isThemePayload } from '../components/PayByLinkThemeContainer/types';

export const useSaveAction = (
    setIsSaving: Dispatch<StateUpdater<boolean>>,
    setIsSaveError: Dispatch<StateUpdater<boolean>>,
    setIsSaveSuccess: Dispatch<StateUpdater<boolean>>,
    selectedStore: string | undefined,
    payload: PayByLinkSettingsPayload,
    activeMenuItem: PayByLinkSettingsItem | null,
    getIsValid: () => boolean,
    setSaveActionCalled: Dispatch<StateUpdater<boolean | undefined>>,
    setSavedData: (data: PayByLinkSettingsData) => void,
    setPayload: (payload: PayByLinkSettingsPayload) => void,
    navigateBack?: () => void
) => {
    const { updatePayByLinkTheme, savePayByLinkSettings } = useConfigContext().endpoints;
    const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (navigationTimeoutRef.current) {
                clearTimeout(navigationTimeoutRef.current);
            }
        };
    }, []);

    const onSaveComplete = useCallback(() => {
        if (navigateBack && isFunction(navigateBack)) {
            navigationTimeoutRef.current = setTimeout(() => {
                navigateBack();
            }, 500);
        } else {
            setIsSaving(false);
        }
    }, [navigateBack, setIsSaving]);

    const savePayByLinkTheme = useMutation({
        queryFn: updatePayByLinkTheme,
        options: {
            onSuccess: data => {
                const themeData = { brandName: data?.brandName, logo: data?.logoUrl, fullWidthLogo: data?.fullWidthLogoUrl };
                setSavedData(themeData);
                setPayload(getThemePayload(themeData));
                setIsSaveError(false);
                setIsSaveSuccess(true);
                setIsSaving(false);
            },
            onError: () => {
                setIsSaveError(true);
                setIsSaveSuccess(false);
                setIsSaving(false);
            },
        },
    });

    const onSaveTheme = useCallback(() => {
        if (!selectedStore || isUndefined(payload) || !getIsValid()) return;
        if (!isThemePayload(payload)) return;
        setIsSaving(true);
        savePayByLinkTheme.mutate({ contentType: 'multipart/form-data', body: payload }, { path: { storeId: selectedStore! } });
    }, [savePayByLinkTheme, selectedStore, payload, getIsValid, setIsSaving]);

    const updatePayByLinkTermsAndConditions = useMutation({
        queryFn: savePayByLinkSettings,
        options: {
            onSuccess: data => {
                const savedData = !data || !data?.termsOfServiceUrl ? { termsOfServiceUrl: '' } : data;
                setSavedData(savedData);
                setPayload(savedData);
                setIsSaveError(false);
                setIsSaveSuccess(true);
                onSaveComplete();
            },
            onError: () => {
                setIsSaveError(true);
                setIsSaveSuccess(false);
                setIsSaving(false);
            },
        },
    });

    const onSaveTermsAndConditions = useCallback(() => {
        if (!selectedStore || isUndefined(payload) || !getIsValid()) return;
        if (isThemePayload(payload)) return;
        setIsSaving(true);
        updatePayByLinkTermsAndConditions.mutate(
            {
                contentType: 'application/json',
                body: payload,
            },
            { path: { storeId: selectedStore! } }
        );
    }, [updatePayByLinkTermsAndConditions, selectedStore, payload, getIsValid, setIsSaving]);

    const onSave = useCallback(() => {
        if (!activeMenuItem) return;
        setSaveActionCalled(true);
        if (activeMenuItem === MenuItem.theme) return onSaveTheme();
        if (activeMenuItem === MenuItem.termsAndConditions) return onSaveTermsAndConditions();
    }, [activeMenuItem, onSaveTermsAndConditions, onSaveTheme, setSaveActionCalled]);

    return { onSave };
};

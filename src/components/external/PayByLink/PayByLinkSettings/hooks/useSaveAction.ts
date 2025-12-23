import { useConfigContext } from '../../../../../core/ConfigContext';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { useCallback } from 'preact/hooks';
import { ActiveMenuItem } from '../components/PayByLinkSettingsContainer/context/constants';
import usePayByLinkSettingsContext from '../components/PayByLinkSettingsContainer/context/context';
import { isUndefined } from '../../../../../utils';
import { PayByLinkSettingsPayload } from '../components/PayByLinkSettingsContainer/context/types';
import { getThemePayload } from '../components/PayByLinkSettingsContainer/utils/getThemePayload';

const isThemePayload = (data: PayByLinkSettingsPayload): data is FormData => {
    return data instanceof FormData;
};

export const useSaveAction = () => {
    const { selectedStore, payload, activeMenuItem, getIsValid, setSaveActionCalled, setSavedData, setPayload } = usePayByLinkSettingsContext();

    const { updatePayByLinkTheme, savePayByLinkSettings } = useConfigContext().endpoints;

    const savePayByLinkTheme = useMutation({
        queryFn: updatePayByLinkTheme,
        options: {
            onSuccess: data => {
                setSavedData(data);
                const themeData = { brandName: data.brandName, logo: data.logoUrl, fullWidthLogo: data.fullWidthLogoUrl };
                setPayload(getThemePayload(themeData));
            },
        },
    });

    const onSaveTheme = useCallback(() => {
        if (isUndefined(payload) || !getIsValid()) return;
        if (!isThemePayload(payload)) return;
        savePayByLinkTheme.mutate({ contentType: 'multipart/form-data', body: payload }, { path: { storeId: selectedStore! } });
    }, [savePayByLinkTheme, selectedStore, payload, getIsValid]);

    const updatePayByLinkTermsAndConditions = useMutation({
        queryFn: savePayByLinkSettings,
        options: {
            onSuccess: data => {
                setSavedData(data);
                setPayload(data);
            },
        },
    });

    const onSaveTermsAndConditions = useCallback(() => {
        if (isUndefined(payload) || !getIsValid()) return;
        if (isThemePayload(payload)) return;
        updatePayByLinkTermsAndConditions.mutate(
            {
                contentType: 'application/json',
                body: payload,
            },
            { path: { storeId: selectedStore! } }
        );
    }, [updatePayByLinkTermsAndConditions, selectedStore, payload, getIsValid]);

    const onSave = useCallback(() => {
        setSaveActionCalled(true);
        if (activeMenuItem === ActiveMenuItem.theme) return onSaveTheme();
        if (activeMenuItem === ActiveMenuItem.termsAndConditions) return onSaveTermsAndConditions();
    }, [activeMenuItem, onSaveTermsAndConditions, onSaveTheme, setSaveActionCalled]);

    return { onSave };
};

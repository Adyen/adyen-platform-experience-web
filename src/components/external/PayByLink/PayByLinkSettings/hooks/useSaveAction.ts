import { useConfigContext } from '../../../../../core/ConfigContext';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { useCallback } from 'preact/hooks';
import { ActiveMenuItem } from '../components/PayByLinkSettingsContainer/context/constants';
import usePayByLinkSettingsContext from '../components/PayByLinkSettingsContainer/context/context';

export const useSaveAction = () => {
    const { selectedStore, payload, activeMenuItem, getIsValid, setSaveActionCalled } = usePayByLinkSettingsContext();

    const { updatePayByLinkTheme, savePayByLinkSettings } = useConfigContext().endpoints;

    const savePayByLinkTheme = useMutation({
        queryFn: updatePayByLinkTheme,
        options: {
            onSuccess: data => console.log(data),
        },
    });

    const onSaveTheme = useCallback(() => {
        if (!payload || !getIsValid()) return;
        savePayByLinkTheme.mutate({ contentType: 'multipart/form-data', body: payload }, { path: { storeId: selectedStore! } });
    }, [savePayByLinkTheme, selectedStore, payload, getIsValid]);

    const updatePayByLinkTermsAndConditions = useMutation({
        queryFn: savePayByLinkSettings,
        options: {
            // onSuccess: () => {
            //     setIsTermsAndConditionsChanged(false);
            //     setShowInvalidURL(false);
            //     setShowNotCheckedRequirementsError(false);
            //     setIsRequirementsChecked(false);
            //     initialTermsAndConditionsURL.current = termsAndConditionsURL;
            // },
        },
    });

    const onSaveTermsAndConditions = useCallback(() => {
        if (!payload || !getIsValid()) return;
        updatePayByLinkTermsAndConditions.mutate(
            {
                contentType: 'application/json',
                body: {
                    termsOfServiceUrl: payload!,
                },
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

import { useConfigContext } from '../../../../core/ConfigContext';

export const useSettingsPermission = () => {
    const { savePayByLinkSettings, getPayByLinkSettings, getPayByLinkTheme, updatePayByLinkTheme } = useConfigContext().endpoints;

    return {
        themeViewEnabled: !!getPayByLinkTheme && !!updatePayByLinkTheme,
        termsAndConditionsViewEnabled: !!getPayByLinkSettings && !!savePayByLinkSettings,
        canSaveTheme: !!updatePayByLinkTheme,
        canSaveTermsAndConditions: !!savePayByLinkSettings,
    };
};

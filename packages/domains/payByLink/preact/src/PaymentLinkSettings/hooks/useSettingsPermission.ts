import { useConfigContext } from '../../../../core/ConfigContext';

export const useSettingsPermission = () => {
    const { savePayByLinkSettings, getPayByLinkSettings, getPayByLinkTheme, updatePayByLinkTheme } = useConfigContext().endpoints;

    return {
        themeEnabled: !!getPayByLinkTheme && !!updatePayByLinkTheme,
        termsAndConditionsEnabled: !!getPayByLinkSettings && !!savePayByLinkSettings,
    };
};

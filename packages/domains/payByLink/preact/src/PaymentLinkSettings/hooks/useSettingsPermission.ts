import { useConfigContext } from '@integration-components/core/preact';

export const useSettingsPermission = () => {
    const { savePayByLinkSettings, getPayByLinkSettings, getPayByLinkTheme, updatePayByLinkTheme } = useConfigContext().endpoints;

    return {
        themeEnabled: !!getPayByLinkTheme && !!updatePayByLinkTheme,
        termsAndConditionsEnabled: !!getPayByLinkSettings && !!savePayByLinkSettings,
    };
};

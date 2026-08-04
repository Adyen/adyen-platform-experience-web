import { computed } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';

export function useSettingsPermission() {
    const config = useConfigContext();

    const themeEnabled = computed(() => !!config.endpoints.getPayByLinkTheme && !!config.endpoints.updatePayByLinkTheme);
    const termsAndConditionsEnabled = computed(() => !!config.endpoints.getPayByLinkSettings && !!config.endpoints.savePayByLinkSettings);

    return { themeEnabled, termsAndConditionsEnabled };
}

export default useSettingsPermission;

import { computed } from 'vue';
import { usePayByLinkContext } from '../../integration/context';

export function useSettingsPermission() {
    const runtime = usePayByLinkContext().runtime;

    const themeEnabled = computed(() => !!runtime.endpoints.getPayByLinkTheme && !!runtime.endpoints.updatePayByLinkTheme);
    const termsAndConditionsEnabled = computed(() => !!runtime.endpoints.getPayByLinkSettings && !!runtime.endpoints.savePayByLinkSettings);

    return { themeEnabled, termsAndConditionsEnabled };
}

export default useSettingsPermission;

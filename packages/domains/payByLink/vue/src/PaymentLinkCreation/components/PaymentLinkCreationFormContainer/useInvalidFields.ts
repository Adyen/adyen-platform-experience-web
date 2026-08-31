import { ref } from 'vue';
import type { TranslationKey } from '@integration-components/core';
import localInvalidFieldsConfig from '../../../../../domain/src/config/invalidFieldsConfig.json';
import { usePayByLinkContext } from '../../../integration/context';

export interface InvalidFieldsConfig {
    fields: Record<string, TranslationKey>;
    messages: Record<string, TranslationKey>;
}

interface AdyenErrorLike {
    invalidFields?: Array<{ name: string; message: string }>;
    requestId?: string;
    errorCode?: string;
}

export function useInvalidFields() {
    const { i18n, runtime } = usePayByLinkContext();
    const { getCdnConfig } = runtime;
    const localConfig = localInvalidFieldsConfig as unknown as InvalidFieldsConfig;
    const invalidFieldsConfig = ref<InvalidFieldsConfig>(localConfig);

    async function loadInvalidFieldsConfig() {
        if (!getCdnConfig) return;
        const config = await getCdnConfig<InvalidFieldsConfig>({
            subFolder: 'payByLink',
            name: 'invalidFieldsConfig',
            fallback: localConfig,
        });
        invalidFieldsConfig.value = config ?? localConfig;
    }

    void loadInvalidFieldsConfig();

    function getMappedInvalidFields(error: AdyenErrorLike | Error | null): string[] {
        if (!error || !('invalidFields' in error) || !error.invalidFields?.length) return [];
        return error.invalidFields
            .map(field => {
                const fieldKey = invalidFieldsConfig.value.fields?.[field.name];
                const messageKey = invalidFieldsConfig.value.messages?.[field.message];
                if (!fieldKey && !messageKey) return null;
                const fieldName = fieldKey ? i18n.get(fieldKey) : field.name;
                if (!messageKey) return `${fieldName}`;
                return `${fieldName} (${i18n.get(messageKey)})`;
            })
            .filter((message): message is string => message !== null);
    }

    return { invalidFieldsConfig, getMappedInvalidFields };
}

import { ref } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import type { TranslationKey } from '@integration-components/core';
import localTermsRequirementsConfig from '../../../../domain/src/config/termsRequirementsConfig.json';

export interface TermsRequirementItem {
    key: TranslationKey;
}

export interface TermsRequirementSection {
    id: string;
    titleKey: TranslationKey;
    descriptionKey: TranslationKey;
    items: TermsRequirementItem[];
}

export interface TermsRequirementsConfig {
    titleKey: TranslationKey;
    sections: TermsRequirementSection[];
}

export function useTermsRequirementsConfig() {
    const { getCdnConfig } = useCoreContext();

    const localTerms = localTermsRequirementsConfig as unknown as TermsRequirementsConfig;
    const termsRequirementsConfig = ref<TermsRequirementsConfig>(localTerms);

    const getTermsRequirementsConfig = async () => {
        const config = await getCdnConfig?.<TermsRequirementsConfig>({
            subFolder: 'payByLink',
            name: 'termsRequirementsConfig',
            fallback: localTerms,
        });
        termsRequirementsConfig.value = config ?? localTerms;
    };

    return { termsRequirementsConfig, getTermsRequirementsConfig };
}

export default useTermsRequirementsConfig;

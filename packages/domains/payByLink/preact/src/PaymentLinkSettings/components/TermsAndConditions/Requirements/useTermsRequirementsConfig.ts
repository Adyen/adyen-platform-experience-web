import { useCallback, useState } from 'preact/hooks';
import { useCoreContext } from '@integration-components/core/preact';
import localTermsRequirementsConfig from '../../../../config/termsRequirementsConfig.json';
import { TranslationKey } from '@integration-components/core';

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

export const useTermsRequirementsConfig = () => {
    const { getCdnConfig } = useCoreContext();

    const localTerms = localTermsRequirementsConfig as unknown as TermsRequirementsConfig;
    const [termsRequirementsConfig, setTermsRequirementsConfig] = useState<TermsRequirementsConfig>(localTerms);

    const getTermsRequirementsConfig = useCallback(async () => {
        const config = await getCdnConfig?.<TermsRequirementsConfig>({
            subFolder: 'payByLink',
            name: 'termsRequirementsConfig',
            fallback: localTerms,
        });

        setTermsRequirementsConfig(config ?? localTerms);
    }, [getCdnConfig, localTerms]);

    return {
        termsRequirementsConfig,
        getTermsRequirementsConfig,
    };
};

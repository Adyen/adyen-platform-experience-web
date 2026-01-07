import { useCallback, useState } from 'preact/hooks';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import localTermsRequirementsConfig from '../../../../../../config/payByLink/termsRequirementsConfig.json';
import { TranslationKey } from '../../../../../../translations';

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
            subFolder: 'paymentLinks',
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

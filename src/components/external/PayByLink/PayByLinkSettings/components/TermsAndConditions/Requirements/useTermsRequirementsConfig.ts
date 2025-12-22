import { useCallback, useState } from 'preact/hooks';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import localTermsRequirementsConfig from '../../../../../../../config/payByLink/termsRequirementsConfig.json';

export interface TermsRequirementItem {
    key: string;
}

export interface TermsRequirementSection {
    id: string;
    titleKey: string;
    descriptionKey: string;
    items: TermsRequirementItem[];
}

export interface TermsRequirementsConfig {
    titleKey: string;
    sections: TermsRequirementSection[];
}

export const useTermsRequirementsConfig = () => {
    const { getCdnConfig } = useCoreContext();

    const [termsRequirementsConfig, setTermsRequirementsConfig] = useState<TermsRequirementsConfig>(localTermsRequirementsConfig);

    const getTermsRequirementsConfig = useCallback(async () => {
        const config = await getCdnConfig?.<TermsRequirementsConfig>({
            subFolder: 'payByLink',
            name: 'termsRequirementsConfig',
            fallback: localTermsRequirementsConfig,
        });

        setTermsRequirementsConfig(config ?? localTermsRequirementsConfig);
    }, [getCdnConfig]);

    return {
        termsRequirementsConfig,
        getTermsRequirementsConfig,
    };
};

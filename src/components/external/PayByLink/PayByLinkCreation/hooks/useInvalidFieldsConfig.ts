import { useCallback, useEffect, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import localInvalidFieldsConfig from '../../../../../config/payByLink/invalidFieldsConfig.json';
import { TranslationKey } from '../../../../../translations';

export type InvalidFieldsConfig = {
    fields: Record<string, TranslationKey>;
    messages: Record<string, TranslationKey>;
};

export const useInvalidFieldsConfig = () => {
    const { getCdnConfig } = useCoreContext();
    const localConfig = localInvalidFieldsConfig as unknown as InvalidFieldsConfig;
    const [invalidFieldsConfig, setInvalidFieldsConfig] = useState<InvalidFieldsConfig>(localConfig);

    const getInvalidFieldsConfig = useCallback(async () => {
        const config = await getCdnConfig?.<InvalidFieldsConfig>({
            subFolder: 'payByLink',
            name: 'invalidFieldsConfig',
            fallback: localConfig,
        });
        setInvalidFieldsConfig(config ?? localConfig);
    }, [getCdnConfig, localConfig]);

    useEffect(() => {
        void getInvalidFieldsConfig();
    }, [getInvalidFieldsConfig]);

    return {
        invalidFieldsConfig,
        getInvalidFieldsConfig,
    };
};

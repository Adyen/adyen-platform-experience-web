import type { TranslationOptions } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/vue';
import { getContractTranslationKey, type CapitalContractKeyBase } from '@integration-components/capital/domain';
import type { IContractType } from '@integration-components/types';

export const useCapitalCopy = () => {
    const { i18n } = useCoreContext();

    const getContractCopy = <Base extends CapitalContractKeyBase>(
        base: Base,
        contractType: IContractType | undefined,
        options?: TranslationOptions
    ): string => {
        const normalizedContractType = contractType ?? 'loan';
        return i18n.get(getContractTranslationKey(base, normalizedContractType), options);
    };

    return { getContractCopy };
};

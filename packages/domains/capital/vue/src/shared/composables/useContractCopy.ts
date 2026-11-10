import { toValue, type MaybeRefOrGetter } from 'vue';
import type { TranslationOptions } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/vue';
import type { ContractTypeKeys } from '@integration-components/capital/domain';
import type { IContractType } from '@integration-components/types';

// Returns string when all contract types have a key. Includes undefined when any contract type has no key.
type ContractCopy<Keys extends ContractTypeKeys> = undefined extends Keys[IContractType] ? string | undefined : string;

export const useContractCopy = (contractType: MaybeRefOrGetter<IContractType>) => {
    const { i18n } = useCoreContext();

    const getContractCopy = <Keys extends ContractTypeKeys>(keys: Keys, options?: TranslationOptions) => {
        const key = keys[toValue(contractType)];
        return (key ? i18n.get(key, options) : undefined) as ContractCopy<Keys>;
    };

    return { getContractCopy };
};

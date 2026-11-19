import type { IContractType } from '@integration-components/types';
import type { CapitalTranslationKey } from '../types';

export type ContractTypeKeys = Record<IContractType, CapitalTranslationKey | undefined>;
export type ContractTypeKeyMap = Record<string, ContractTypeKeys>;

export const CASH_ADVANCE_REGIONS: readonly string[] = ['GB'];

export const getIsContractTypeSupported = (contractType: IContractType, region: string | undefined): boolean => {
    switch (contractType) {
        case 'Loan':
            return true;
        case 'CashAdvance':
            return !!region && CASH_ADVANCE_REGIONS.includes(region);
        default:
            return false;
    }
};

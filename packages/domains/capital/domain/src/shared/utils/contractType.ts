import type { IContractType } from '@integration-components/types';
import type { CapitalTranslationKey } from '../types';

export type ContractTypeKeys = Record<IContractType, CapitalTranslationKey | undefined>;
export type ContractTypeKeyMap = Record<string, ContractTypeKeys>;

export const isSupportedContractType = (contractType: IContractType) => contractType === 'Loan' || contractType === 'CashAdvance';

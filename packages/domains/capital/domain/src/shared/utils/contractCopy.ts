import type { CapitalTranslationKey } from '../types';
import { IContractType } from '@integration-components/types';

// Translation keys that have `.loan` variant
type CapitalLoanKey = Extract<CapitalTranslationKey, `${string}.loan`>;

// Translation keys that have `.cashAdvance` variant
type CapitalCashAdvanceKey = Extract<CapitalTranslationKey, `${string}.cashAdvance`>;

type VariantKeyBase<Key extends string, Suffix extends string> = Key extends `${infer Base}.${Suffix}` ? Base : never;

// Translation key bases that have both `.loan` and `.cashAdvance` variants
export type CapitalContractKeyBase = Extract<VariantKeyBase<CapitalLoanKey, 'loan'>, VariantKeyBase<CapitalCashAdvanceKey, 'cashAdvance'>>;

// Translation keys that have both `.loan` and `.cashAdvance` variants
type CapitalContractTranslationKey<Base extends CapitalContractKeyBase = CapitalContractKeyBase> = `${Base}.${IContractType}`;

// Resolves a translation key base and variant to the exact translation key
export const getContractTranslationKey = <Base extends CapitalContractKeyBase>(
    base: Base,
    contractType: IContractType
): CapitalContractTranslationKey<Base> => `${base}.${contractType}` as CapitalContractTranslationKey<Base>;

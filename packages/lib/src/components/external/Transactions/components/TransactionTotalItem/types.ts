import { TranslationKey } from '@src/core/Localization/types';
import { Ref } from 'preact';
import { ITransactionTotal } from '@src/types';

export type TransactionTotalItemProps = {
    total?: ITransactionTotal;
    isHeader?: boolean;
    isSkeleton?: boolean;
    isLoading?: boolean;
    widths?: number[];
    onWidthsSet: (widths: number[]) => void;
};

export type AmountColumnConfig = { labelKey: TranslationKey; amountKey: 'incomings' | 'expenses'; ref: Ref<HTMLDivElement> };

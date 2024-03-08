import { TranslationKey } from '@src/core/Localization/types';
import { Ref } from 'preact';
import { ITransactionTotal } from '@src/types';

export type TotalItemProps = {
    total?: ITransactionTotal;
    isHeader?: boolean;
    isSkeleton?: boolean;
    isLoading?: boolean;
    widths?: number[];
    onWidthsSet: (widths: number[]) => void;
};

export type ColumnConfig = { labelKey: TranslationKey; amountKey: 'incomings' | 'expenses'; ref: Ref<HTMLDivElement> };

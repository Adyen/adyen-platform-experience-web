import { IBalance } from '@src/types';

export type BalanceItemProps = {
    balance?: IBalance;
    isHeader?: boolean;
    isSkeleton?: boolean;
    isLoading?: boolean;
    widths?: number[];
    onWidthsSet: (widths: number[]) => void;
};

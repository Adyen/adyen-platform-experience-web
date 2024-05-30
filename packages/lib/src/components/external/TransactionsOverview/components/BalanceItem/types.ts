import { IBalanceWithKey } from '../../../../../types';

export type BalanceItemProps = {
    balance?: IBalanceWithKey;
    isHeader?: boolean;
    isSkeleton?: boolean;
    isLoading?: boolean;
    widths?: number[];
    onWidthsSet: (widths: number[]) => void;
    isEmpty?: boolean;
};

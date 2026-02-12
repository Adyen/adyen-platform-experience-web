import { IBalanceWithKey } from '../Balances/types';

export type BalanceItemProps = {
    balance?: IBalanceWithKey;
    hiddenField?: 'available' | 'reserved';
    isHeader?: boolean;
    showLabelUnderline?: boolean;
    isSkeleton?: boolean;
    isLoading?: boolean;
    widths?: number[];
    onWidthsSet: (widths: number[]) => void;
    availableBalanceElemId?: string;
    reservedBalanceElemId?: string;
};

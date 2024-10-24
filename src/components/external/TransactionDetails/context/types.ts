import { REFUND_MODES, REFUND_REASONS } from './constants';
import type { PropsWithChildren } from 'preact/compat';
import type { ButtonActionObject } from '../../../internal/Button/ButtonActions/types';
import type { ILineItem } from '../../../../types';

export const enum ActiveView {
    DETAILS,
    REFUND,
}

export type RefundMode = (typeof REFUND_MODES)[number];
export type RefundReason = (typeof REFUND_REASONS)[number];

type _TransactionDataContextBase<T extends TransactionDataContextProviderProps> = Omit<T, _TransactionDataContextExcludedProps> & {
    primaryAction: () => void;
    secondaryAction: () => void;
};

export type _TransactionDataContextExcludedProps =
    | 'children'
    | 'lineItems'
    | 'refundAmount'
    | 'refundAvailable'
    | 'refundDisabled'
    | 'setActiveView'
    | 'setPrimaryAction'
    | 'setSecondaryAction';

export type TransactionDataContext<T extends TransactionDataContextProviderProps> = _TransactionDataContextBase<T>;

export interface TransactionDataContextProviderProps extends PropsWithChildren {
    lineItems: readonly ILineItem[];
    refundAvailable: boolean;
    refundDisabled: boolean;
    setActiveView: (activeView: ActiveView) => void;
    setPrimaryAction: (action: ButtonActionObject | undefined) => void;
    setSecondaryAction: (action: ButtonActionObject | undefined) => void;
}

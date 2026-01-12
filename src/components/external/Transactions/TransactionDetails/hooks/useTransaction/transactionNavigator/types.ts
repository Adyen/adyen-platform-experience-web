import type { ITransaction } from '../../../../../../../types';

export interface TransactionNavigation {
    // `undefined` only for the first navigation
    get from(): ITransaction['id'] | undefined;
    get to(): ITransaction['id'];
}

export type TransactionNavigationCallback = (navigation: TransactionNavigation) => unknown;

export interface TransactionNavigator {
    get canNavigateBackward(): boolean;
    get canNavigateForward(): boolean;
    get currentTransaction(): ITransaction['id'] | undefined;
    readonly backward: () => void;
    readonly forward: () => void;
    readonly reset: (fromTransactionId?: ITransaction['id'], toTransactionId?: ITransaction['id']) => void;
    set onNavigation(callback: TransactionNavigationCallback | null | undefined);
}

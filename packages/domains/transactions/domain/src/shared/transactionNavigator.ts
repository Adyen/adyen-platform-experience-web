import { EMPTY_ARRAY, enumerable, getter, isEmptyString, isFunction, isNullish, struct } from '@integration-components/utils';
import type { ITransaction } from '@integration-components/types';

export interface TransactionNavigation {
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

export const createDuplexTransactionNavigator = () => {
    let [currentTransactionId, previousTransactionId, fromTransactionId, toTransactionId] = EMPTY_ARRAY as readonly ITransaction['id'][];
    const canNavigateBackward = () => !!(currentTransactionId && currentTransactionId === toTransactionId && fromTransactionId);
    const canNavigateForward = () => !!(currentTransactionId && currentTransactionId === fromTransactionId && toTransactionId);

    let onNavigation: TransactionNavigationCallback | null = null;

    const backward: TransactionNavigator['backward'] = () => {
        if (canNavigateBackward()) {
            previousTransactionId = currentTransactionId;
            currentTransactionId = fromTransactionId;
            triggerNavigationCallback();
        }
    };

    const forward: TransactionNavigator['forward'] = () => {
        if (canNavigateForward()) {
            previousTransactionId = currentTransactionId;
            currentTransactionId = toTransactionId;
            triggerNavigationCallback();
        }
    };

    const reset: TransactionNavigator['reset'] = (_fromTransactionId, _toTransactionId) => {
        const cachedCurrentTransactionId = currentTransactionId;
        currentTransactionId = previousTransactionId = fromTransactionId = toTransactionId = undefined;

        if (!isEmptyString(_fromTransactionId) && !isEmptyString(_toTransactionId)) {
            fromTransactionId = _fromTransactionId;
            toTransactionId = _toTransactionId;

            currentTransactionId =
                cachedCurrentTransactionId === fromTransactionId || cachedCurrentTransactionId === toTransactionId
                    ? cachedCurrentTransactionId
                    : fromTransactionId;

            if (cachedCurrentTransactionId !== currentTransactionId) triggerNavigationCallback();
        }
    };

    const setNavigationCallback = (callback: TransactionNavigationCallback | null | undefined) => {
        if (isNullish(callback)) {
            onNavigation = null;
        } else if (isFunction(callback) && onNavigation !== (onNavigation = callback)) {
            triggerNavigationCallback();
        }
    };

    const triggerNavigationCallback = () => {
        if (isEmptyString(currentTransactionId)) return;

        const from = previousTransactionId;
        const to = currentTransactionId!;
        previousTransactionId = undefined;

        onNavigation?.(
            struct<TransactionNavigation>({
                from: getter(() => from),
                to: getter(() => to),
            })
        );
    };

    return struct<TransactionNavigator>({
        backward: enumerable(backward),
        forward: enumerable(forward),
        canNavigateBackward: getter(canNavigateBackward),
        canNavigateForward: getter(canNavigateForward),
        currentTransaction: getter(() => currentTransactionId),
        onNavigation: { set: setNavigationCallback },
        reset: enumerable(reset),
    });
};

export default createDuplexTransactionNavigator;

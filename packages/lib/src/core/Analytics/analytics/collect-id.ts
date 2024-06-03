import { httpPost } from '../../Http/http';
import Storage from '../../../primitives/storage/Storage';
import { CheckoutAttemptIdSession, CollectIdProps } from './types';

/**
 * If the checkout attempt ID was stored more than fifteen minutes ago, then we should request a new ID.
 * More here: COWEB-1099
 */
function confirmSessionDurationIsMaxFifteenMinutes(checkoutAttemptIdSession: CheckoutAttemptIdSession): boolean {
    if (!checkoutAttemptIdSession?.id) return false;

    const fifteenMinInMs = 1000 * 60 * 15;
    const fifteenMinAgoTimestamp = Date.now() - fifteenMinInMs;
    return checkoutAttemptIdSession.timestamp > fifteenMinAgoTimestamp;
}

/**
 * Log event to Adyen
 * @param config - ready to be serialized and included in the body of request
 * @returns a function returning a promise containing the response of the call
 */
const collectId = ({ loadingContext, experiments }: CollectIdProps) => {
    let promise: Promise<string | undefined>;

    const options = {
        errorLevel: 'silent' as const,
        loadingContext: loadingContext,
        path: `v2/analytics/id`,
    };

    return (): Promise<string | undefined> => {
        if (promise) return promise;

        const storage = new Storage<CheckoutAttemptIdSession>('checkout-attempt-id', window.sessionStorage);
        const checkoutAttemptIdSession = storage.get();

        if (checkoutAttemptIdSession && confirmSessionDurationIsMaxFifteenMinutes(checkoutAttemptIdSession)) {
            return Promise.resolve(checkoutAttemptIdSession.id);
        }

        promise = httpPost<{ id: string }>(options, { experiments })
            .then(conversion => {
                if (conversion.id) {
                    storage.set({ id: conversion.id, timestamp: Date.now() });
                    return conversion.id;
                }
                return undefined;
            })
            .catch(() => undefined);

        return promise;
    };
};

export default collectId;

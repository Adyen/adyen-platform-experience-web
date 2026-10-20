import type { AdyenPlatformExperienceError } from '@integration-components/core';

type CashOutTranslationKey = `cashOut.${string}`;

export type CashOutErrorMessageInfo = {
    title: CashOutTranslationKey;
    messages: CashOutTranslationKey[];
    refreshComponent?: boolean;
    onContactSupport?: () => void;
    requestId?: string;
};

export const COMMON_CASH_OUT_ERROR_MESSAGE = {
    couldNotLoadCashOut: 'cashOut.overview.errors.unavailable',
    tryRefreshingThePage: 'cashOut.common.errors.retry',
    somethingWentWrong: 'cashOut.common.errors.somethingWentWrong',
} as const;

const UNKNOWN_ERROR: CashOutErrorMessageInfo = {
    title: COMMON_CASH_OUT_ERROR_MESSAGE.somethingWentWrong,
    messages: [COMMON_CASH_OUT_ERROR_MESSAGE.couldNotLoadCashOut, COMMON_CASH_OUT_ERROR_MESSAGE.tryRefreshingThePage],
    refreshComponent: true,
};

export const getCashOutErrorMessage = (error: AdyenPlatformExperienceError | undefined): CashOutErrorMessageInfo => {
    switch (error?.errorCode) {
        // Loading errors are technical, so support can't act on them; add a case only for errors that need another action.
        default:
            return UNKNOWN_ERROR;
    }
};

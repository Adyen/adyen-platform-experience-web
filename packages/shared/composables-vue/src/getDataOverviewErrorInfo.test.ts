import { describe, expect, test, vi } from 'vitest';
import { getDataOverviewErrorInfo } from './getDataOverviewErrorInfo';

type TestKey =
    | 'domain.errors.accountInvalid'
    | 'domain.errors.accountUnavailable'
    | 'domain.errors.contactSupport'
    | 'domain.errors.errorCode'
    | 'domain.errors.errorCodeSupport'
    | 'domain.errors.notFound'
    | 'domain.errors.requestInvalid'
    | 'domain.errors.retry'
    | 'domain.errors.somethingWentWrong'
    | 'domain.errors.unexpected'
    | 'domain.errors.unavailable';

const errorMessage: TestKey = 'domain.errors.unavailable';

const ERROR_KEYS = {
    contactSupport: 'domain.errors.contactSupport',
    errorCode: 'domain.errors.errorCode',
    errorCodeSupport: 'domain.errors.errorCodeSupport',
    notFound: 'domain.errors.notFound',
    requestInvalid: 'domain.errors.requestInvalid',
    retry: 'domain.errors.retry',
    somethingWentWrong: 'domain.errors.somethingWentWrong',
    unexpected: 'domain.errors.unexpected',
} as const;

const OVERVIEW_ERROR_KEYS = {
    accountInvalid: 'domain.errors.accountInvalid',
    accountUnavailable: 'domain.errors.accountUnavailable',
} as const;

describe('getDataOverviewErrorInfo', () => {
    test('renders the permission-unavailable state with support guidance, like the Preact ConfigProvider', () => {
        expect(
            getDataOverviewErrorInfo<TestKey>({
                balanceAccountsError: new Error('Accounts unavailable'),
                errorMessage,
                errorKeys: ERROR_KEYS,
                hasError: true,
                isBalanceAccountIdWrong: true,
                overviewErrorKeys: OVERVIEW_ERROR_KEYS,
            })
        ).toEqual({
            title: 'domain.errors.somethingWentWrong',
            messages: [errorMessage, 'domain.errors.contactSupport'],
        });
    });

    test('resolves balance-account fetch errors through the shared error mapping', () => {
        const onContactSupport = vi.fn();

        expect(
            getDataOverviewErrorInfo<TestKey>({
                balanceAccountsError: new Error('Accounts unavailable'),
                errorMessage,
                errorKeys: ERROR_KEYS,
                hasError: false,
                isBalanceAccountIdWrong: false,
                onContactSupport,
                overviewErrorKeys: OVERVIEW_ERROR_KEYS,
            })
        ).toEqual({
            title: 'domain.errors.somethingWentWrong',
            messages: ['domain.errors.accountUnavailable', 'domain.errors.retry'],
            refreshComponent: true,
        });
    });

    test('describes an invalid requested balance account', () => {
        expect(
            getDataOverviewErrorInfo<TestKey>({
                errorMessage,
                errorKeys: ERROR_KEYS,
                hasError: false,
                isBalanceAccountIdWrong: true,
                overviewErrorKeys: OVERVIEW_ERROR_KEYS,
            })
        ).toEqual({
            title: 'domain.errors.somethingWentWrong',
            messages: [errorMessage, 'domain.errors.accountInvalid'],
        });
    });

    test('returns no error when the overview is available', () => {
        expect(
            getDataOverviewErrorInfo<TestKey>({
                errorMessage,
                errorKeys: ERROR_KEYS,
                hasError: false,
                isBalanceAccountIdWrong: false,
                overviewErrorKeys: OVERVIEW_ERROR_KEYS,
            })
        ).toBeUndefined();
    });
});

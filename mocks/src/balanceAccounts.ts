import type { BalanceAccount } from '@adyen/adyen-fp-web/src/types/models/api/balance-account';

export const BALANCE_ACCOUNT_DETAILS_1: BalanceAccount = {
    accountHolderId: 'AH32272223222B5CWF3T48T9B',
    defaultCurrencyCode: 'EUR',
    platformPaymentConfiguration: { salesDayClosingTime: '17:00', settlementDelayDays: 0 },
    timeZone: 'Europe/Amsterdam',
    balances: [
        { available: 64900, balance: 64900, currency: 'AUD', reserved: 0 },
        { available: -25383, balance: -25383, currency: 'CZK', reserved: 0 },
        { available: 188, balance: 188, currency: 'HUF', reserved: 0 },
        { available: 57000, balance: 57000, currency: 'SEK', reserved: 0 },
        { available: 60000, balance: 60000, currency: 'CHF', reserved: 0 },
        { available: 6101, balance: 6101, currency: 'GBP', reserved: 0 },
        { available: 9294747450, balance: 9294747450, currency: 'USD', reserved: 0 },
        { available: 190221099, balance: 190225993, currency: 'EUR', reserved: -4894 },
        { available: 16325, balance: 16325, currency: 'PLN', reserved: 0 },
    ],
    id: 'BA3227C223222B5CWF3T45SWD',
    status: 'active',
};

export const BALANCE_ACCOUNT_DETAILS_2: BalanceAccount = {
    accountHolderId: 'AH32272223222B5CWF3T48T9B',
    defaultCurrencyCode: 'EUR',
    platformPaymentConfiguration: { salesDayClosingTime: '17:00', settlementDelayDays: 0 },
    timeZone: 'Europe/Amsterdam',
    balances: [
        { available: 649020, balance: 64900, currency: 'AUD', reserved: 0 },
        { available: -25383, balance: -25383, currency: 'CZK', reserved: 0 },
        { available: 188, balance: 188, currency: 'HUF', reserved: 0 },
        { available: 57000, balance: 57000, currency: 'SEK', reserved: 0 },
        { available: 60000, balance: 60000, currency: 'CHF', reserved: 0 },
        { available: 6101, balance: 6101, currency: 'GBP', reserved: 0 },
        { available: 9294747450, balance: 9294747450, currency: 'USD', reserved: 0 },
        { available: 190221099, balance: 190225993, currency: 'EUR', reserved: -4894 },
        { available: 16325, balance: 16325, currency: 'PLN', reserved: 0 },
    ],
    id: 'BA3227B2248HRV5BHTQPQ5W22',
    status: 'active',
};

export const BALANCE_ACCOUNT_DETAILS_3: BalanceAccount = {
    accountHolderId: 'AH32272223222B5CWF3T48T9B',
    defaultCurrencyCode: 'EUR',
    platformPaymentConfiguration: { salesDayClosingTime: '17:00', settlementDelayDays: 0 },
    timeZone: 'Europe/Amsterdam',
    balances: [
        { available: 649040, balance: 64900, currency: 'AUD', reserved: 0 },
        { available: -25383, balance: -25383, currency: 'CZK', reserved: 0 },
        { available: 188, balance: 188, currency: 'HUF', reserved: 0 },
        { available: 57000, balance: 57000, currency: 'SEK', reserved: 0 },
        { available: 60000, balance: 60000, currency: 'CHF', reserved: 0 },
        { available: 6101, balance: 6101, currency: 'GBP', reserved: 0 },
        { available: 9294747450, balance: 9294747450, currency: 'USD', reserved: 0 },
        { available: 190221099, balance: 190225993, currency: 'EUR', reserved: -4894 },
        { available: 16325, balance: 16325, currency: 'PLN', reserved: 0 },
    ],
    id: 'BA3227B2248HRV5BHTQPQ5W22',
    status: 'active',
};

export const BALANCE_ACCOUNT_DETAILS_4: BalanceAccount = {
    accountHolderId: 'AH32272223222B5CWF3T48T9B',
    defaultCurrencyCode: 'EUR',
    platformPaymentConfiguration: { salesDayClosingTime: '17:00', settlementDelayDays: 0 },
    timeZone: 'Europe/Amsterdam',
    balances: [
        { available: 649001, balance: 64900, currency: 'AUD', reserved: 0 },
        { available: -25383, balance: -25383, currency: 'CZK', reserved: 0 },
        { available: 188, balance: 188, currency: 'HUF', reserved: 0 },
        { available: 57000, balance: 57000, currency: 'SEK', reserved: 0 },
        { available: 60000, balance: 60000, currency: 'CHF', reserved: 0 },
        { available: 6101, balance: 6101, currency: 'GBP', reserved: 0 },
        { available: 9294747450, balance: 9294747450, currency: 'USD', reserved: 0 },
        { available: 190221099, balance: 190225993, currency: 'EUR', reserved: -4894 },
        { available: 16325, balance: 16325, currency: 'PLN', reserved: 0 },
    ],
    id: 'BA3227B2248HRV5BHTQPQ5W22',
    status: 'active',
};

export const BALANCE_ACCOUNTS = [BALANCE_ACCOUNT_DETAILS_1, BALANCE_ACCOUNT_DETAILS_2, BALANCE_ACCOUNT_DETAILS_3, BALANCE_ACCOUNT_DETAILS_4] as const;

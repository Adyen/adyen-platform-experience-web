import type { CurrencyCode } from '@src/localization/types';
import type { StatusType } from '../status';

export interface Balance {
    available: number;
    balance: number;
    currency: CurrencyCode;
    reserved: number;
}

export interface BalanceAccount {
    accountHolderId: string;
    defaultCurrencyCode: CurrencyCode;
    timeZone: string;
    balances: Balance[];
    id: string;
    status: StatusType;
    platformPaymentConfiguration: { salesDayClosingTime: string; settlementDelayDays: number };
}

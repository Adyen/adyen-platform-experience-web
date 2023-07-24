import type { CurrencyCode } from '../../../utils/constants/currency-codes';
import type { StatusType } from '../status';

export interface BalanceAccount {
    accountHolderId: string;
    defaultCurrencyCode: CurrencyCode;
    timeZone: string;
    balances: {
        available: number;
        balance: number;
        currency: CurrencyCode;
        reserved: number;
    }[];
    id: string;
    status: StatusType;
    platformPaymentConfiguration: { salesDayClosingTime: string; settlementDelayDays: number };
}

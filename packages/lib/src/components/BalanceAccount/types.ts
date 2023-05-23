import { CurrencyCode } from '../../utils/constants/currency-codes';
import { UIElementProps } from '../types';

export interface BalanceAccountDetailsProps extends UIElementProps {
    balanceAccount: {
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
        status: string;
        platformPaymentConfiguration: { salesDayClosingTime: string; settlementDelayDays: number };
    };
    onChange?: (newState: Record<any, any>) => void;
}

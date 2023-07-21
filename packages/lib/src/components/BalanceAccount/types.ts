import { CurrencyCode } from '../../utils/constants/currency-codes';
import type { UIElementProps } from '../types';
import type { StatusType } from '@src/components/internal/Status/types';

export interface BalanceAccountComponentProps extends UIElementProps {
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
        status: StatusType;
        platformPaymentConfiguration: { salesDayClosingTime: string; settlementDelayDays: number };
    };
    onChange?: (newState: Record<any, any>) => void;
}

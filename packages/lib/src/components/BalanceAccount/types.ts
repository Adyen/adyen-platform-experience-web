import { CurrencyCode } from '../../utils/constants/currency-codes';
import { UIElementProps } from '../types';
import { StatusType } from '@src/components/internal/Status/types';

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
        status: StatusType;
        platformPaymentConfiguration: { salesDayClosingTime: string; settlementDelayDays: number };
    };
    onChange?: (newState: Record<any, any>) => void;
}

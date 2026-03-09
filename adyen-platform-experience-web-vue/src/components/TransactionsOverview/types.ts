import type { CoreInstance } from '../../core/types';

// ── API model types (mirrored from Preact codebase schemas) ──

export interface IAmount {
    currency: string;
    value: number;
}

export interface IPaymentMethod {
    description?: string;
    lastFourDigits?: string;
    type: string;
}

export interface IBankAccount {
    accountNumberLastFourDigits: string;
}

export type ITransactionCategory = 'ATM' | 'Capital' | 'Correction' | 'Payment' | 'Refund' | 'Chargeback' | 'Transfer' | 'Other';
export type ITransactionStatus = 'Pending' | 'Booked' | 'Reversed';

export interface ITransaction {
    amountBeforeDeductions: IAmount;
    balanceAccountId: string;
    bankAccount?: IBankAccount;
    category: ITransactionCategory;
    createdAt: string;
    id: string;
    netAmount: IAmount;
    paymentMethod?: IPaymentMethod;
    paymentPspReference?: string;
    status: ITransactionStatus;
}

export interface ITransactionCategoryTotal {
    value: number;
    category: ITransactionCategory;
}

export interface ITransactionTotal {
    currency: string;
    expenses: number;
    incomings: number;
    total: number;
    breakdown: {
        expenses: ITransactionCategoryTotal[];
        incomings: ITransactionCategoryTotal[];
    };
}

export interface IBalanceAccountBase {
    defaultCurrencyCode: string;
    description?: string;
    id: string;
    timeZone: string;
}

export interface IBalance {
    currency: string;
    reservedValue: number;
    value: number;
}

// ── Timerange types (simplified from Preact Calendar internals) ──

export interface RangeTimestamps {
    readonly from: number;
    readonly to: number;
    now: number;
    timezone: string | undefined;
}

// ── TransactionsOverview-specific types ──

export interface TransactionsFilters {
    balanceAccount?: Readonly<IBalanceAccountBase>;
    categories: readonly ITransactionCategory[];
    statuses: readonly ITransactionStatus[];
    currencies: readonly IAmount['currency'][];
    createdDate: RangeTimestamps;
    paymentPspReference?: string;
}

export const enum TransactionsView {
    TRANSACTIONS = 'transactions',
    INSIGHTS = 'insights',
}

export type TransactionsDateRange =
    | 'common.filters.types.date.rangeSelect.options.last7Days'
    | 'common.filters.types.date.rangeSelect.options.last30Days'
    | 'common.filters.types.date.rangeSelect.options.last180Days'
    | 'common.filters.types.date.rangeSelect.options.thisWeek'
    | 'common.filters.types.date.rangeSelect.options.lastWeek'
    | 'common.filters.types.date.rangeSelect.options.thisMonth'
    | 'common.filters.types.date.rangeSelect.options.lastMonth'
    | 'common.filters.types.date.rangeSelect.options.yearToDate'
    | 'common.filters.types.date.rangeSelect.options.custom';

// ── External props (for library consumers) ──

export interface TransactionsOverviewExternalProps {
    core: CoreInstance;
    balanceAccountId?: string;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    onRecordSelection?: (record: { id: string }) => void;
    showDetails?: boolean;
    hideTitle?: boolean;
    onContactSupport?: () => void;
    onFiltersChanged?: (...args: any[]) => void;
    dataCustomization?: {
        list?: {
            fields?: any[];
            onDataRetrieve?: (data: any) => Promise<any[]> | any[];
        };
        details?: {
            fields?: Record<string, { visibility?: 'hidden' | 'visible'; label?: string }>;
            onDataRetrieve?: (data: any) => Promise<Record<string, any>> | Record<string, any>;
        };
    };
}

// ── Internal component props ──

export interface TransactionOverviewProps {
    balanceAccountId?: string;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    onRecordSelection?: (record: { id: string }) => void;
    showDetails?: boolean;
    hideTitle?: boolean;
    onContactSupport?: () => void;
    onFiltersChanged?: (...args: any[]) => void;
    dataCustomization?: TransactionsOverviewExternalProps['dataCustomization'];
    balanceAccounts: IBalanceAccountBase[] | undefined;
    isLoadingBalanceAccount: boolean;
}

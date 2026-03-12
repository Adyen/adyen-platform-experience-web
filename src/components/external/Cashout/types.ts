export type CashoutVariant = 'full' | 'summary' | 'button';

export type CashoutProps = {
    accountKey: string;
    variant?: CashoutVariant;
    onCashoutComplete?: (data: { status: string }) => void;
};

export type CashoutElementProps = CashoutProps;

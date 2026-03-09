export interface PayoutAmount {
    value: number;
    currency: string;
}

export interface AmountBreakdownItem {
    category?: string;
    amount?: PayoutAmount;
}

export interface AmountBreakdowns {
    adjustmentBreakdown?: AmountBreakdownItem[];
    fundsCapturedBreakdown?: AmountBreakdownItem[];
}

export interface Payout {
    payoutAmount: PayoutAmount;
    fundsCapturedAmount?: PayoutAmount;
    adjustmentAmount: PayoutAmount;
    unpaidAmount?: PayoutAmount;
    createdAt?: string;
    isSumOfSameDayPayouts?: boolean;
}

export interface IPayoutDetails {
    payout?: Payout;
    amountBreakdowns?: AmountBreakdowns;
}

export interface ExtraFieldConfig {
    href?: string;
    target?: string;
    src?: string;
    alt?: string;
    action?: () => void;
    className?: string;
}

export interface ExtraField {
    type?: 'text' | 'link' | 'icon' | 'button';
    value: string;
    visibility?: 'hidden' | 'visible';
    config?: ExtraFieldConfig;
}

export interface PayoutDetailsCustomization {
    details?: Record<string, ExtraField>;
}

export interface PayoutDataProps {
    payout?: IPayoutDetails;
    isFetching?: boolean;
    balanceAccountId: string;
    balanceAccountDescription?: string;
    extraFields?: Record<string, ExtraField>;
    dataCustomization?: { details?: PayoutDetailsCustomization };
}

export interface PayoutDetailsProps {
    balanceAccountId: string;
    balanceAccountDescription?: string;
    dataCustomization?: { details?: PayoutDetailsCustomization };
}

export interface PayoutDetailsExternalProps {
    core: import('../../core/types').CoreInstance;
    dataCustomization?: { details?: PayoutDetailsCustomization };
    date: string;
    id: string;
}

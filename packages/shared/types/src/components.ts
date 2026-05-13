export type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

export type ExternalComponentType =
    | 'capitalOverview'
    | 'capitalOffer'
    | 'disputes'
    | 'disputesManagement'
    | 'paymentLinkCreation'
    | 'paymentLinkDetails'
    | 'paymentLinksOverview'
    | 'paymentLinkSettings'
    | 'payouts'
    | 'payoutDetails'
    | 'reports'
    | 'transactions'
    | 'transactionDetails';

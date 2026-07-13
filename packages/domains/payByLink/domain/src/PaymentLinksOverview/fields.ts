export const PAYMENT_LINKS_TABLE_FIELDS = [
    'paymentLinkId',
    'merchantReference',
    'storeCode',
    'currency',
    'amount',
    'status',
    'expirationDate',
    'creationDate',
    'linkType',
    'shopperEmail',
] as const;

export type PaymentLinkTableCols = (typeof PAYMENT_LINKS_TABLE_FIELDS)[number];

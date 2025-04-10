export const DISPUTE_DETAILS_CLASS = 'adyen-pe-dispute-details';
export const DISPUTE_DATA_CLASS = 'adyen-pe-dispute-data';
export const DISPUTE_STATUS_BOX = `${DISPUTE_DATA_CLASS}__status-box`;
export const DISPUTE_DATA_ACTION_BAR = `${DISPUTE_DATA_CLASS}__action-bar`;
export const DISPUTE_DATA_LABEL = `${DISPUTE_DATA_CLASS}__label`;
export const DISPUTE_DATA_LIST = `${DISPUTE_DATA_CLASS}__list`;
export const DISPUTE_DATA_LIST_EVIDENCE = `${DISPUTE_DATA_CLASS}__list--evidence`;
export const DISPUTE_DATA_CONTACT_SUPPORT = `${DISPUTE_DATA_CLASS}__contact-support`;

export const DISPUTE_DETAILS_RESERVED_FIELDS_SET = new Set([
    'disputeReason',
    'disputeReasonCode',
    'disputeReference',
    'disputePspReference',
    'disputeMerchantReference',
] as const);

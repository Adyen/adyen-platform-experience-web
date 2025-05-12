export const DISPUTE_DATA_CLASS = 'adyen-pe-dispute-data';
export const DISPUTE_DATA_MOBILE_CLASS = 'adyen-pe-dispute-data--mobile';
export const DISPUTE_STATUS_BOX = `${DISPUTE_DATA_CLASS}__status-box`;
export const DISPUTE_DATA_ACTION_BAR = `${DISPUTE_DATA_CLASS}__action-bar`;
export const DISPUTE_DATA_LABEL = `${DISPUTE_DATA_CLASS}__label`;
export const DISPUTE_DATA_LIST = `${DISPUTE_DATA_CLASS}__list`;
export const DISPUTE_DATA_LIST_EVIDENCE = `${DISPUTE_DATA_CLASS}__list--evidence`;
export const DISPUTE_DATA_CONTACT_SUPPORT = `${DISPUTE_DATA_CLASS}__contact-support`;
export const DISPUTE_DATA_ISSUER_COMMENT = `${DISPUTE_DATA_CLASS}__issuer-comment`;
export const DISPUTE_DATA_ISSUER_COMMENTS = `${DISPUTE_DATA_CLASS}__issuer-comments`;
export const DISPUTE_DATA_ISSUER_COMMENTS_EXPANDED = `${DISPUTE_DATA_ISSUER_COMMENTS}--expanded`;
export const DISPUTE_DATA_ISSUER_COMMENTS_TRUNCATED = `${DISPUTE_DATA_ISSUER_COMMENTS}--truncated`;
export const DISPUTE_DATA_ISSUER_COMMENTS_GROUP = `${DISPUTE_DATA_CLASS}__issuer-comments-group`;

export const DISPUTE_DETAILS_RESERVED_FIELDS_SET = new Set([
    'allowedDefenseReasons',
    'balanceAccount',
    'amount',
    'createdAt',
    'defensibility',
    'dueDate',
    'id',
    'latestDefense',
    'paymentMerchantReference',
    'paymentMethod',
    'paymentPspReference',
    'reasonCode',
    'reasonGroup',
    'status',
] as const);

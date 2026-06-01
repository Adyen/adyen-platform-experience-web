export const DISPUTE_DATA_CLASS = 'adyen-pe-dispute-data';
export const DISPUTE_DATA_MOBILE_CLASS = 'adyen-pe-dispute-data--mobile';
export const DISPUTE_STATUS_BOX = `${DISPUTE_DATA_CLASS}__status-box`;
export const DISPUTE_DATA_ACTION_BAR = `${DISPUTE_DATA_CLASS}__action-bar`;
export const DISPUTE_DATA_LABEL = `${DISPUTE_DATA_CLASS}__label`;
export const DISPUTE_DATA_LIST = `${DISPUTE_DATA_CLASS}__list`;
export const DISPUTE_DATA_LIST_EVIDENCE = `${DISPUTE_DATA_CLASS}__list--evidence`;
export const DISPUTE_DATA_LIST_EVIDENCE_ERROR_MESSAGE = `${DISPUTE_DATA_CLASS}__list-evidence-error-message`;
export const DISPUTE_DATA_ISSUER_COMMENT = `${DISPUTE_DATA_CLASS}__issuer-comment`;
export const DISPUTE_DATA_ISSUER_COMMENTS = `${DISPUTE_DATA_CLASS}__issuer-comments`;
export const DISPUTE_DATA_ISSUER_COMMENTS_EXPANDED = `${DISPUTE_DATA_ISSUER_COMMENTS}--expanded`;
export const DISPUTE_DATA_ISSUER_COMMENTS_TRUNCATED = `${DISPUTE_DATA_ISSUER_COMMENTS}--truncated`;
export const DISPUTE_DATA_ISSUER_COMMENTS_ALERT = `${DISPUTE_DATA_CLASS}__issuer-comments-alert`;
export const DISPUTE_DATA_ISSUER_COMMENTS_GROUP = `${DISPUTE_DATA_CLASS}__issuer-comments-group`;
export const DISPUTE_DATA_ALERT = 'adyen-pe-dispute-data-alert';
export const DISPUTE_DATA_ERROR_CONTAINER = 'adyen-pe-dispute-data__error-container';
export const DISPUTE_DATA_STATUS_BOX_SKELETON = 'adyen-pe-dispute-data__status-box-skeleton';
export const DISPUTE_DATA_PROPERTIES_SKELETON = 'adyen-pe-dispute-data__properties-skeleton';
export const DISPUTE_DATA_PROPERTIES_SKELETON_ELEMENT = 'adyen-pe-dispute-data__properties-skeleton-element';
export const DISPUTE_DATA_PROPERTIES_SKELETON_CONTAINER = 'adyen-pe-dispute-data__properties-skeleton-container';
export const DISPUTE_DATA_STATUS_BOX_STATUS_CONTAINER = 'adyen-pe-dispute-data__status-box-status-container';
export const DISPUTE_DATA_STATUS_BOX_STATUS = 'adyen-pe-dispute-data__status-box-status';
export const DISPUTE_DATA_STATUS_BOX_AMOUNT = 'adyen-pe-dispute-data__status-box-amount';
export const DISPUTE_DATA_STATUS_BOX_PAYMENT_METHOD = 'adyen-pe-dispute-data__status-box-payment-method';
export const DISPUTE_DATA_SKELETON_CONTAINER = 'adyen-pe-dispute-data__skeleton-container';
export const DISPUTE_DATA_STATUS_BOX_PAYMENT_METHOD_CONTAINER = 'adyen-pe-dispute-data__status-box-payment-method-container';

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

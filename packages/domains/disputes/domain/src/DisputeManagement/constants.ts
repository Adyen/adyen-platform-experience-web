export const DISPUTE_DETAILS_RESERVED_FIELDS = [
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
] as const;

export const DISPUTE_DETAILS_RESERVED_FIELDS_SET = new Set(DISPUTE_DETAILS_RESERVED_FIELDS);

const UPLOAD_DOCUMENT_MAX_SIZE = {
    '2MB': 2097152,
    '10MB': 10485760,
} as const;

export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/tiff'] as const;

export const DOCUMENT_MAX_SIZE: { [k in (typeof ALLOWED_FILE_TYPES)[number]]: number } = {
    'application/pdf': UPLOAD_DOCUMENT_MAX_SIZE['2MB'],
    'image/jpeg': UPLOAD_DOCUMENT_MAX_SIZE['10MB'],
    'image/jpg': UPLOAD_DOCUMENT_MAX_SIZE['10MB'],
    'image/tiff': UPLOAD_DOCUMENT_MAX_SIZE['10MB'],
};

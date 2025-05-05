import { IDisputeDetail, IDisputeStatusGroup, IDisputeDefenseDocument, IDisputeListItem, IDisputeType } from '../../src/types/api/models/disputes';
import { BALANCE_ACCOUNTS } from './balanceAccounts';

const getDate = (daysOffset = 0, originDate = new Date()) => {
    const date = new Date(originDate);
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString();
};

const MC_CONSUMER_DEFENSE_REASONS = [
    'AirlineFlightProvided',
    'CancellationOrReturns',
    'CancellationTermsFailed',
    'CreditOrCancellationPolicyProperlyDisclosed',
    'GoodsNotReturned',
    'GoodsOrServicesProvided',
    'GoodsRepairedOrReplaced',
    'GoodsWereAsDescribed',
    'InvalidChargeback',
    'InvalidChargebackBundling',
    'NotRecurring',
    'PaymentByOtherMeans',
    'PurchaseProperlyPosted',
    'ServicesProvidedAfterCancellation',
    'SupplyDefenseMaterial',
] as const;

const MC_FRAUD_DEFENSE_REASONS = [
    'AirlineCompellingEvidence',
    'ChipAndPinLiabilityShift',
    'ChipLiabilityShift',
    'CompellingEvidence',
    'CVC2ValidationProgram',
    'IdentifiedAddendum',
    'InvalidChargeback',
    'InvalidChargebackBundling',
    'NoShowTransaction',
    'ProofOfCardPresenceAndSignatureChipNoPIN',
    'ProofOfCardPresenceAndSignatureNotMasterCardWorldWideNetwork',
    'ProofOfCardPresenceAndSignatureWithTerminalReceipt',
    'RecurringTransactionsCompellingEvidence',
    'RecurringTransactionsCompellingMerchantEvidence',
    'ShippedToAVS',
    'SupplyDefenseMaterial',
] as const;

const VISA_CONSUMER_DEFENSE_REASONS = ['InvalidChargeback', 'MerchandiseReceived', 'ServicesProvided'] as const;

const VISA_FRAUD_DEFENSE_REASONS = ['AdditionalInformation'] as const;

const DEFAULT_DETAIL_DEFENSE: IDisputeDetail['defense'] = {
    defendedOn: getDate(-1),
    defendedThroughComponent: true,
    reason: 'Defense reason',
    suppliedDocuments: ['GoodsOrServicesProvided', 'WrittenRebuttal'],
};
const DEFAULT_DETAIL_PAYMENT: IDisputeDetail['payment'] = {
    balanceAccount: { timeZone: 'UTC', description: 'Main balance account' },
    isRefunded: false,
    merchantReference: 'b2c3d4e5-f6g7-5890-efgh',
    paymentMethod: { lastFourDigits: '1234', type: 'visa' },
    pspReference: 'a1b2c3d4-e5f6-4789-abcd',
};

const DEFAULT_DETAIL_DISPUTE: IDisputeDetail['dispute'] = {
    amount: {
        value: 211100,
        currency: 'EUR',
    },
    dueDate: new Date(new Date().setHours(23)).toISOString(),
    createdAt: getDate(-10),
    pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000001',
    reason: {
        category: 'CONSUMER_DISPUTE',
        title: 'Request for information',
        code: '1234',
    },
    allowedDefenseReasons: [],
    defensibility: 'ACCEPTABLE',
    type: 'CHARGEBACK',
    status: 'UNDEFENDED',
};

const DEFAULT_DISPUTE_DETAIL: IDisputeDetail = {
    dispute: DEFAULT_DETAIL_DISPUTE,
    payment: DEFAULT_DETAIL_PAYMENT,
};

// CHARGEBACKS

export const CHARGEBACK_UNDEFENDED: IDisputeDetail = {
    dispute: {
        ...DEFAULT_DETAIL_DISPUTE,
        status: 'UNDEFENDED',
    },
    payment: DEFAULT_DETAIL_PAYMENT,
};

export const CHARGEBACK_WON: IDisputeDetail = {
    ...DEFAULT_DISPUTE_DETAIL,
    dispute: {
        ...DEFAULT_DETAIL_DISPUTE,
        status: 'WON',
        defensibility: 'NOT_ACTIONABLE',
    },
    defense: DEFAULT_DETAIL_DEFENSE,
};

export const CHARGEBACK_LOST: IDisputeDetail = {
    ...DEFAULT_DISPUTE_DETAIL,
    dispute: {
        ...DEFAULT_DETAIL_DISPUTE,
        status: 'LOST',
        defensibility: 'NOT_ACTIONABLE',
    },
    defense: DEFAULT_DETAIL_DEFENSE,
};

export const CHARGEBACK_LOST_NO_ACTION: IDisputeDetail = {
    dispute: {
        ...DEFAULT_DETAIL_DISPUTE,
        defensibility: 'NOT_ACTIONABLE',
        status: 'LOST',
    },
    payment: DEFAULT_DETAIL_PAYMENT,
};

export const CHARGEBACK_ACCEPTED: IDisputeDetail = {
    ...DEFAULT_DISPUTE_DETAIL,
    dispute: {
        ...DEFAULT_DETAIL_DISPUTE,
        status: 'ACCEPTED',
        defensibility: 'NOT_ACTIONABLE',
    },
};

export const CHARGEBACK_DEFENDABLE: IDisputeDetail = {
    payment: {
        ...DEFAULT_DETAIL_PAYMENT,
        paymentMethod: {
            type: 'mc',
            lastFourDigits: '4509',
        },
    },
    dispute: {
        ...DEFAULT_DETAIL_DISPUTE,
        reason: {
            category: 'CONSUMER_DISPUTE',
            code: 'AirlineFlightProvided',
            title: 'Consumer dispute',
        },
        status: 'UNDEFENDED',
        defensibility: 'DEFENDABLE',
        allowedDefenseReasons: [...MC_CONSUMER_DEFENSE_REASONS],
    },
};
export const CHARGEBACK_DEFENDABLE_EXTERNALLY: IDisputeDetail = {
    ...DEFAULT_DISPUTE_DETAIL,
    dispute: {
        ...DEFAULT_DETAIL_DISPUTE,
        status: 'UNDEFENDED',
        defensibility: 'DEFENDABLE_EXTERNALLY',
    },
};
export const CHARGEBACK_ACCEPTABLE: IDisputeDetail = {
    dispute: {
        ...DEFAULT_DETAIL_DISPUTE,
        status: 'UNDEFENDED',
        defensibility: 'ACCEPTABLE',
    },
    payment: DEFAULT_DETAIL_PAYMENT,
};

export const CHARGEBACK_DEFENDED: IDisputeDetail = {
    ...DEFAULT_DISPUTE_DETAIL,
    dispute: {
        ...DEFAULT_DETAIL_DISPUTE,
        status: 'PENDING',
        defensibility: 'NOT_ACTIONABLE',
    },
    defense: DEFAULT_DETAIL_DEFENSE,
};
export const CHARGEBACK_DEFENDED_EXTERNALLY: IDisputeDetail = {
    ...DEFAULT_DISPUTE_DETAIL,
    dispute: {
        ...DEFAULT_DETAIL_DISPUTE,
        defensibility: 'NOT_ACTIONABLE',
        status: 'PENDING',
    },
    defense: {
        ...DEFAULT_DETAIL_DEFENSE,
        defendedThroughComponent: false,
    },
};

// REQUEST FOR INFORMATION

export const RFI_UNRESPONDED: IDisputeDetail = {
    ...DEFAULT_DISPUTE_DETAIL,
    dispute: {
        ...DEFAULT_DISPUTE_DETAIL.dispute,
        status: 'UNRESPONDED',
        type: 'REQUEST_FOR_INFORMATION',
        defensibility: 'DEFENDABLE_EXTERNALLY',
    },
};

export const RFI_RESPONDED: IDisputeDetail = {
    ...DEFAULT_DISPUTE_DETAIL,
    dispute: {
        ...DEFAULT_DETAIL_DISPUTE,
        status: 'RESPONDED',
        type: 'REQUEST_FOR_INFORMATION',
        defensibility: 'NOT_ACTIONABLE',
    },
    defense: DEFAULT_DETAIL_DEFENSE,
};

export const RFI_EXPIRED: IDisputeDetail = {
    ...DEFAULT_DISPUTE_DETAIL,
    dispute: {
        ...DEFAULT_DETAIL_DISPUTE,
        status: 'EXPIRED',
        type: 'REQUEST_FOR_INFORMATION',
        defensibility: 'NOT_ACTIONABLE',
    },
};

// NOTIFICATION OF FRAUD

export const NOTIFICATION_OF_FRAUD: IDisputeDetail = {
    ...DEFAULT_DISPUTE_DETAIL,
    dispute: {
        ...DEFAULT_DISPUTE_DETAIL.dispute,
        status: 'LOST',
        type: 'NOTIFICATION_OF_FRAUD',
        defensibility: 'NOT_ACTIONABLE',
    },
};

const CHARGEBACKS = [
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000001',
        status: 'UNDEFENDED',
        dueDate: new Date(new Date().setHours(23)).toISOString(),
        createdAt: getDate(-10),
        paymentMethod: { type: 'mc', lastFourDigits: '0001', description: 'MasterCard' },
        reason: { category: 'FRAUD', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 211100 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000002',
        status: 'UNDEFENDED',
        dueDate: new Date(new Date().setHours(20)).toISOString(),
        createdAt: getDate(-9),
        paymentMethod: { type: 'visa', lastFourDigits: '0002', description: 'Visa Credit Card' },
        reason: { category: 'REQUEST_FOR_INFORMATION', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 222200 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000003',
        status: 'UNRESPONDED',
        dueDate: getDate(2),
        createdAt: getDate(-7),
        paymentMethod: { type: 'paypal', lastFourDigits: '0003', description: 'PayPal' },
        reason: { category: 'ADJUSTMENT', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 233300 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000004',
        status: 'UNDEFENDED',
        dueDate: getDate(20),
        createdAt: getDate(-7),
        paymentMethod: { type: 'klarna', lastFourDigits: '0004', description: 'Klarna Pay Later' },
        reason: { category: 'CONSUMER_DISPUTE', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 244400 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000005',
        status: 'UNRESPONDED',
        dueDate: getDate(11),
        createdAt: getDate(-4),
        paymentMethod: { type: 'amex', lastFourDigits: '0005', description: 'American Express' },
        reason: { category: 'FRAUD', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 255500 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000006',
        status: 'UNDEFENDED',
        dueDate: getDate(13),
        createdAt: getDate(-4),
        paymentMethod: { type: 'mc', lastFourDigits: '0006', description: 'MasterCard' },
        reason: { category: 'CONSUMER_DISPUTE', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 266600 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000007',
        status: 'UNRESPONDED',
        dueDate: getDate(15),
        createdAt: getDate(-3),
        paymentMethod: { type: 'visa', lastFourDigits: '0007', description: 'Visa Credit Card' },
        reason: { category: 'FRAUD', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 277700 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000008',
        status: 'UNRESPONDED',
        dueDate: getDate(16),
        createdAt: getDate(-3),
        paymentMethod: { type: 'paypal', lastFourDigits: '0008', description: 'PayPal' },
        reason: { category: 'FRAUD', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 288800 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000009',
        status: 'UNRESPONDED',
        dueDate: getDate(18),
        createdAt: getDate(-3),
        paymentMethod: { type: 'klarna', lastFourDigits: '0009', description: 'Klarna Pay Later' },
        reason: { category: 'OTHER', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 299900 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000010',
        status: 'UNDEFENDED',
        dueDate: getDate(20),
        createdAt: getDate(-2),
        paymentMethod: { type: 'amex', lastFourDigits: '0010', description: 'American Express' },
        reason: { category: 'OTHER', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 311000 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000011',
        status: 'UNDEFENDED',
        dueDate: getDate(22),
        createdAt: getDate(-2),
        paymentMethod: { type: 'mc', lastFourDigits: '0011', description: 'MasterCard' },
        reason: { category: 'CONSUMER_DISPUTE', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 322100 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000012',
        status: 'UNDEFENDED',
        dueDate: getDate(23),
        createdAt: getDate(-2),
        paymentMethod: { type: 'visa', lastFourDigits: '0012', description: 'Visa Credit Card' },
        reason: { category: 'CONSUMER_DISPUTE', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 333200 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000013',
        status: 'UNDEFENDED',
        dueDate: getDate(26),
        createdAt: getDate(-2),
        paymentMethod: { type: 'paypal', lastFourDigits: '0013', description: 'PayPal' },
        reason: { category: 'OTHER', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 344300 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000014',
        status: 'UNDEFENDED',
        dueDate: getDate(29),
        createdAt: getDate(-1),
        paymentMethod: { type: 'klarna', lastFourDigits: '0014', description: 'Klarna Pay Later' },
        reason: { category: 'FRAUD', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 355400 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000015',
        status: 'UNRESPONDED',
        dueDate: getDate(30),
        createdAt: getDate(-2),
        paymentMethod: { type: 'amex', lastFourDigits: '0015', description: 'American Express' },
        reason: { category: 'FRAUD', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 366500 },
    },
] satisfies Readonly<IDisputeListItem[]>;

const ALL_DISPUTES = [
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000016',
        status: 'PENDING',
        createdAt: getDate(-3),
        paymentMethod: { type: 'mc', lastFourDigits: '0016', description: 'MasterCard' },
        reason: { category: 'FRAUD', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 377600 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000017',
        status: 'EXPIRED',
        createdAt: getDate(-3),
        paymentMethod: { type: 'visa', lastFourDigits: '0017', description: 'Visa Credit Card' },
        reason: { category: 'FRAUD', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 388700 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000018',
        status: 'ACCEPTED',
        createdAt: getDate(-3),
        paymentMethod: { type: 'paypal', lastFourDigits: '0018', description: 'PayPal' },
        reason: { category: 'FRAUD', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 399800 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000019',
        status: 'WON',
        createdAt: getDate(-3),
        paymentMethod: { type: 'klarna', lastFourDigits: '0019', description: 'Klarna Pay Later' },
        reason: { category: 'OTHER', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 410900 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000020',
        status: 'LOST',
        createdAt: getDate(-5),
        paymentMethod: { type: 'amex', lastFourDigits: '0020', description: 'American Express' },
        reason: { category: 'FRAUD', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 422000 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000021',
        status: 'PENDING',
        createdAt: getDate(-5),
        paymentMethod: { type: 'mc', lastFourDigits: '0021', description: 'MasterCard' },
        reason: { category: 'CONSUMER_DISPUTE', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 433100 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000022',
        status: 'WON',
        createdAt: getDate(-5),
        paymentMethod: { type: 'visa', lastFourDigits: '0022', description: 'Visa Credit Card' },
        reason: { category: 'OTHER', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 444200 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000024',
        status: 'LOST',
        createdAt: getDate(-6),
        paymentMethod: { type: 'klarna', lastFourDigits: '0024', description: 'Klarna Pay Later' },
        reason: { category: 'FRAUD', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 466400 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000025',
        status: 'EXPIRED',
        createdAt: getDate(-6),
        paymentMethod: { type: 'amex', lastFourDigits: '0025', description: 'American Express' },
        reason: { category: 'FRAUD', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 477500 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000026',
        status: 'PENDING',
        createdAt: getDate(-8),
        paymentMethod: { type: 'mc', lastFourDigits: '0026', description: 'MasterCard' },
        reason: { category: 'FRAUD', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 488600 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000027',
        status: 'LOST',
        createdAt: getDate(-8),
        paymentMethod: { type: 'visa', lastFourDigits: '0027', description: 'Visa Credit Card' },
        reason: { category: 'CONSUMER_DISPUTE', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 499700 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000031',
        status: 'WON',
        createdAt: getDate(-12),
        paymentMethod: { type: 'visa', lastFourDigits: '0031', description: 'Visa Credit Card' },
        reason: { category: 'OTHER', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 244100 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000033',
        status: 'ACCEPTED',
        createdAt: getDate(-12),
        paymentMethod: { type: 'mc', lastFourDigits: '0033', description: 'MasterCard' },
        reason: { category: 'FRAUD', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 266300 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000034',
        status: 'EXPIRED',
        createdAt: getDate(-12),
        paymentMethod: { type: 'visa', lastFourDigits: '0034', description: 'Visa Credit Card' },
        reason: { category: 'FRAUD', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 277400 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000038',
        status: 'LOST',
        createdAt: getDate(-15),
        paymentMethod: { type: 'paypal', lastFourDigits: '0038', description: 'PayPal' },
        reason: { category: 'CONSUMER_DISPUTE', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 321800 },
    },
] satisfies Readonly<IDisputeListItem[]>;

const FRAUD_ALERTS = [
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000041',
        status: 'LOST',
        dueDate: new Date(new Date().setHours(23)).toISOString(),
        createdAt: getDate(-10),
        paymentMethod: { type: 'mc', lastFourDigits: '0001', description: 'MasterCard' },
        reason: { category: 'FRAUD', code: '4835', title: 'Fraudulent use of account number' },
        amount: { currency: 'EUR', value: 211100 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000042',
        status: 'LOST',
        dueDate: new Date(new Date().setHours(20)).toISOString(),
        createdAt: getDate(-9),
        paymentMethod: { type: 'visa', lastFourDigits: '0002', description: 'Visa Credit Card' },
        reason: { category: 'FRAUD', code: '4835', title: 'Fraudulent use of account number' },
        amount: { currency: 'USD', value: 222200 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000043',
        status: 'LOST',
        dueDate: getDate(2),
        createdAt: getDate(-7),
        paymentMethod: { type: 'paypal', lastFourDigits: '0003', description: 'PayPal' },
        reason: { category: 'FRAUD', code: '4835', title: 'Fraudulent use of account number' },
        amount: { currency: 'EUR', value: 233300 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000044',
        status: 'LOST',
        dueDate: getDate(20),
        createdAt: getDate(-7),
        paymentMethod: { type: 'klarna', lastFourDigits: '0004', description: 'Klarna Pay Later' },
        reason: { category: 'FRAUD', code: '4835', title: 'Fraudulent use of account number' },
        amount: { currency: 'USD', value: 244400 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000045',
        status: 'LOST',
        dueDate: getDate(11),
        createdAt: getDate(-4),
        paymentMethod: { type: 'amex', lastFourDigits: '0005', description: 'American Express' },
        reason: { category: 'FRAUD', code: '4835', title: 'Fraudulent use of account number' },
        amount: { currency: 'EUR', value: 255500 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000046',
        status: 'LOST',
        dueDate: getDate(13),
        createdAt: getDate(-4),
        paymentMethod: { type: 'mc', lastFourDigits: '0006', description: 'MasterCard' },
        reason: { category: 'FRAUD', code: '4835', title: 'Fraudulent use of account number' },
        amount: { currency: 'USD', value: 266600 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000047',
        status: 'LOST',
        dueDate: getDate(15),
        createdAt: getDate(-3),
        paymentMethod: { type: 'visa', lastFourDigits: '0007', description: 'Visa Credit Card' },
        reason: { category: 'FRAUD', code: '4835', title: 'Fraudulent use of account number' },
        amount: { currency: 'EUR', value: 577700 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000048',
        status: 'LOST',
        dueDate: getDate(16),
        createdAt: getDate(-3),
        paymentMethod: { type: 'paypal', lastFourDigits: '0008', description: 'PayPal' },
        reason: { category: 'FRAUD', code: '4835', title: 'Fraudulent use of account number' },
        amount: { currency: 'USD', value: 200000 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000049',
        status: 'LOST',
        dueDate: getDate(18),
        createdAt: getDate(-3),
        paymentMethod: { type: 'klarna', lastFourDigits: '0009', description: 'Klarna Pay Later' },
        reason: { category: 'FRAUD', code: '4835', title: 'Fraudulent use of account number' },
        amount: { currency: 'EUR', value: 299900 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000050',
        status: 'LOST',
        dueDate: getDate(20),
        createdAt: getDate(-2),
        paymentMethod: { type: 'amex', lastFourDigits: '0010', description: 'American Express' },
        reason: { category: 'FRAUD', code: '4835', title: 'Fraudulent use of account number' },
        amount: { currency: 'USD', value: 311000 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000051',
        status: 'LOST',
        dueDate: getDate(22),
        createdAt: getDate(-2),
        paymentMethod: { type: 'mc', lastFourDigits: '0011', description: 'MasterCard' },
        reason: { category: 'FRAUD', code: '4835', title: 'Fraudulent use of account number' },
        amount: { currency: 'EUR', value: 412000 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000052',
        status: 'LOST',
        dueDate: getDate(23),
        createdAt: getDate(-2),
        paymentMethod: { type: 'visa', lastFourDigits: '0012', description: 'Visa Credit Card' },
        reason: { category: 'FRAUD', code: '4835', title: 'Fraudulent use of account number' },
        amount: { currency: 'USD', value: 911200 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000053',
        status: 'LOST',
        dueDate: getDate(26),
        createdAt: getDate(-2),
        paymentMethod: { type: 'paypal', lastFourDigits: '0013', description: 'PayPal' },
        reason: { category: 'FRAUD', code: '4835', title: 'Fraudulent use of account number' },
        amount: { currency: 'EUR', value: 344300 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000054',
        status: 'LOST',
        dueDate: getDate(29),
        createdAt: getDate(-1),
        paymentMethod: { type: 'klarna', lastFourDigits: '0014', description: 'Klarna Pay Later' },
        reason: { category: 'FRAUD', code: '4835', title: 'Fraudulent use of account number' },
        amount: { currency: 'USD', value: 755400 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000055',
        status: 'LOST',
        dueDate: getDate(30),
        createdAt: getDate(-2),
        paymentMethod: { type: 'amex', lastFourDigits: '0015', description: 'American Express' },
        reason: { category: 'FRAUD', code: '4835', title: 'Fraudulent use of account number' },
        amount: { currency: 'EUR', value: 510500 },
    },
] satisfies Readonly<IDisputeListItem[]>;

export const DISPUTES = [...CHARGEBACKS, ...ALL_DISPUTES, ...FRAUD_ALERTS] as const satisfies Readonly<IDisputeListItem[]>;

export const MAIN_BALANCE_ACCOUNT = BALANCE_ACCOUNTS.find(({ id }) => id === 'BA32272223222B5CTDQPM6W2H')!;

export const getDisputesByStatusGroup = (status: IDisputeStatusGroup) => {
    switch (status) {
        case 'CHARGEBACKS':
            return CHARGEBACKS;
        case 'FRAUD_ALERTS':
            return FRAUD_ALERTS;
        case 'ONGOING_AND_CLOSED':
        default:
            return ALL_DISPUTES;
    }
};
export const getAllowedDisputeDefenseReasons = (dispute: (typeof DISPUTES)[number]) => {
    switch (dispute.paymentMethod.type) {
        case 'mc': {
            if (dispute.reason.category === 'CONSUMER_DISPUTE') return MC_CONSUMER_DEFENSE_REASONS;
            if (dispute.reason.category === 'FRAUD') return MC_FRAUD_DEFENSE_REASONS;
            break;
        }
        case 'visa': {
            if (dispute.reason.category === 'CONSUMER_DISPUTE') return VISA_CONSUMER_DEFENSE_REASONS;
            if (dispute.reason.category === 'FRAUD') return VISA_FRAUD_DEFENSE_REASONS;
            break;
        }
    }
};

export const getApplicableDisputeDefenseDocuments = (dispute: (typeof DISPUTES)[number], defenseReason: string) => {
    const allowedDefenseReasons = getAllowedDisputeDefenseReasons(dispute);
    const disputeDefenseReason = defenseReason as NonNullable<typeof allowedDefenseReasons>[number];

    if (!allowedDefenseReasons || !(allowedDefenseReasons as any).includes(disputeDefenseReason)) return;

    switch (dispute.paymentMethod.type) {
        case 'mc': {
            if (dispute.reason.category === 'CONSUMER_DISPUTE') {
                switch (disputeDefenseReason) {
                    case 'AirlineFlightProvided':
                        return [
                            { documentTypeCode: 'FlightTicketUsed', requirementLevel: 'ONE_OR_MORE' } as const,
                            { documentTypeCode: 'FlightTookPlace', requirementLevel: 'ONE_OR_MORE' } as const,
                            { documentTypeCode: 'PaperAirlineTicket', requirementLevel: 'ONE_OR_MORE' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'CancellationOrReturns':
                        return [
                            { documentTypeCode: 'CancellationNeverAccepted', requirementLevel: 'ONE_OR_MORE' } as const,
                            { documentTypeCode: 'GoodsNotReturned', requirementLevel: 'ONE_OR_MORE' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'CancellationTermsFailed':
                    case 'InvalidChargebackBundling':
                    case 'NotRecurring':
                    case 'ServicesProvidedAfterCancellation':
                        return [{ documentTypeCode: 'InvalidChargeback', requirementLevel: 'REQUIRED' } as const] satisfies IDisputeDefenseDocument[];

                    case 'CreditOrCancellationPolicyProperlyDisclosed':
                        return [
                            { documentTypeCode: 'DisclosureAtPointOfInteraction', requirementLevel: 'REQUIRED' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'GoodsNotReturned':
                        return [
                            { documentTypeCode: 'GoodsNotReturned', requirementLevel: 'REQUIRED' } as const,
                            { documentTypeCode: 'TIDorInvoice', requirementLevel: 'OPTIONAL' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'GoodsOrServicesProvided':
                        return [
                            { documentTypeCode: 'ProofOfAbilityToProvideServices', requirementLevel: 'ONE_OR_MORE' } as const,
                            { documentTypeCode: 'ProofOfGoodsOrServicesProvided', requirementLevel: 'ONE_OR_MORE' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'GoodsRepairedOrReplaced':
                        return [
                            { documentTypeCode: 'GoodsRepairedOrReplaced', requirementLevel: 'REQUIRED' } as const,
                            { documentTypeCode: 'TIDorInvoice', requirementLevel: 'OPTIONAL' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'GoodsWereAsDescribed':
                        return [
                            { documentTypeCode: 'GoodsWereAsDescribed', requirementLevel: 'REQUIRED' } as const,
                            { documentTypeCode: 'TIDorInvoice', requirementLevel: 'REQUIRED' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'InvalidChargeback':
                        return [{ documentTypeCode: 'InvalidChargeback', requirementLevel: 'OPTIONAL' } as const] satisfies IDisputeDefenseDocument[];

                    case 'PaymentByOtherMeans':
                        return [
                            { documentTypeCode: 'PaymentByOtherMeans', requirementLevel: 'REQUIRED' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'PurchaseProperlyPosted':
                        return [
                            { documentTypeCode: 'ProofOfRetailSaleRatherThanCredit', requirementLevel: 'REQUIRED' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'SupplyDefenseMaterial':
                        return [
                            { documentTypeCode: 'DefenseMaterial', requirementLevel: 'REQUIRED' } as const,
                            { documentTypeCode: 'TIDorInvoice', requirementLevel: 'OPTIONAL' } as const,
                        ] satisfies IDisputeDefenseDocument[];
                }
            } else if (dispute.reason.category === 'FRAUD') {
                switch (disputeDefenseReason) {
                    case 'AirlineCompellingEvidence':
                        return [
                            { documentTypeCode: 'CompellingEvidence', requirementLevel: 'REQUIRED' } as const,
                            { documentTypeCode: 'AdditionalTransactions', requirementLevel: 'ONE_OR_MORE' } as const,
                            { documentTypeCode: 'FlightManifest', requirementLevel: 'ONE_OR_MORE' } as const,
                            { documentTypeCode: 'FlightTicket', requirementLevel: 'ONE_OR_MORE' } as const,
                            { documentTypeCode: 'FlightTicketAtBillingAddress', requirementLevel: 'ONE_OR_MORE' } as const,
                            { documentTypeCode: 'FrequentFlyer', requirementLevel: 'ONE_OR_MORE' } as const,
                            { documentTypeCode: 'PassengerIdentification', requirementLevel: 'ONE_OR_MORE' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'ChipAndPinLiabilityShift':
                    case 'ChipLiabilityShift':
                    case 'CVC2ValidationProgram':
                    case 'ProofOfCardPresenceAndSignatureChipNoPIN':
                    case 'ProofOfCardPresenceAndSignatureNotMasterCardWorldWideNetwork':
                    case 'ProofOfCardPresenceAndSignatureWithTerminalReceipt':
                        return [
                            { documentTypeCode: 'PrintedSignedTerminalReceipt', requirementLevel: 'REQUIRED' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'CompellingEvidence':
                        return [
                            { documentTypeCode: 'CardholderIdentification', requirementLevel: 'REQUIRED' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'IdentifiedAddendum':
                        return [
                            { documentTypeCode: 'AddendumDocumentation', requirementLevel: 'REQUIRED' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'InvalidChargeback':
                        return [{ documentTypeCode: 'InvalidChargeback', requirementLevel: 'OPTIONAL' } as const] satisfies IDisputeDefenseDocument[];

                    case 'InvalidChargebackBundling':
                        return [{ documentTypeCode: 'InvalidChargeback', requirementLevel: 'REQUIRED' } as const] satisfies IDisputeDefenseDocument[];

                    case 'NoShowTransaction':
                        return [{ documentTypeCode: 'ProofOfNoShow', requirementLevel: 'REQUIRED' } as const] satisfies IDisputeDefenseDocument[];

                    case 'RecurringTransactionsCompellingEvidence':
                        return [
                            { documentTypeCode: 'CompellingEvidence', requirementLevel: 'REQUIRED' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'RecurringTransactionsCompellingMerchantEvidence':
                        return [
                            { documentTypeCode: 'MerchantProofOfRecurringTransaction', requirementLevel: 'OPTIONAL' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'ShippedToAVS':
                        return [
                            { documentTypeCode: 'PositiveAVS', requirementLevel: 'REQUIRED' } as const,
                            { documentTypeCode: 'ShippedToAVS', requirementLevel: 'REQUIRED' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'SupplyDefenseMaterial':
                        return [
                            { documentTypeCode: 'DefenseMaterial', requirementLevel: 'REQUIRED' } as const,
                            { documentTypeCode: 'TIDorInvoice', requirementLevel: 'OPTIONAL' } as const,
                        ] satisfies IDisputeDefenseDocument[];
                }
            }

            break;
        }

        case 'visa': {
            if (dispute.reason.category === 'CONSUMER_DISPUTE') {
                switch (disputeDefenseReason) {
                    case 'InvalidChargeback':
                        return [{ documentTypeCode: 'InvalidChargeback', requirementLevel: 'OPTIONAL' } as const] satisfies IDisputeDefenseDocument[];

                    case 'MerchandiseReceived':
                        return [
                            { documentTypeCode: 'DateMerchandiseShipped', requirementLevel: 'REQUIRED' } as const,
                            { documentTypeCode: 'ProofOfGoodsOrServicesProvided', requirementLevel: 'REQUIRED' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'ServicesProvided':
                        return [
                            { documentTypeCode: 'ProofOfGoodsOrServicesProvided', requirementLevel: 'REQUIRED' } as const,
                        ] satisfies IDisputeDefenseDocument[];
                }
            } else if (dispute.reason.category === 'FRAUD') {
                switch (disputeDefenseReason) {
                    case 'AdditionalInformation':
                        return [{ documentTypeCode: 'DefenseMaterial', requirementLevel: 'REQUIRED' } as const] satisfies IDisputeDefenseDocument[];
                }
            }

            break;
        }
    }
};

type AdditionalDisputeDetails = Omit<IDisputeDetail, 'dispute'> & { dispute: IDisputeDetail['dispute'] };

export const getAdditionalDisputeDetails = (dispute: (typeof DISPUTES)[number]) => {
    const allowedDefenseReasons = getAllowedDisputeDefenseReasons(dispute);
    const additionalDisputeDetails = {} as AdditionalDisputeDetails;

    let disputeType: IDisputeType = 'CHARGEBACK';

    switch (dispute.status) {
        case 'UNDEFENDED':
            disputeType = 'CHARGEBACK';
            break;
        case 'UNRESPONDED':
            disputeType = 'REQUEST_FOR_INFORMATION';
            break;
        case 'LOST':
            if (dispute.reason.category === 'FRAUD') {
                disputeType = 'NOTIFICATION_OF_FRAUD';
            }
            break;
    }

    additionalDisputeDetails.payment = {
        pspReference: 'KLAHFUW1329523KKL',
        balanceAccount: {
            description: MAIN_BALANCE_ACCOUNT.description ?? MAIN_BALANCE_ACCOUNT.id,
            timeZone: MAIN_BALANCE_ACCOUNT.timeZone,
        },
        isRefunded: false,
        paymentMethod: dispute.paymentMethod,
    };
    additionalDisputeDetails.dispute = {
        ...dispute,
        pspReference: dispute.disputePspReference,
        type: disputeType,
        allowedDefenseReasons: allowedDefenseReasons ? [...allowedDefenseReasons] : [],
        ...(dispute.status === 'UNDEFENDED' || dispute.status === 'UNRESPONDED'
            ? {
                  defensibility: allowedDefenseReasons ? 'DEFENDABLE' : 'DEFENDABLE_EXTERNALLY',
              }
            : {
                  defensibility: 'NOT_ACTIONABLE',
                  defense: {
                      reason: 'ServicesProvided',
                      suppliedDocuments: ['GoodsOrServicesProvided', 'WrittenRebuttal'],
                      defendedOn: getDate(1, new Date(dispute.createdAt)),
                      defendedThroughComponent: true,
                  },
              }),
    };

    if (dispute.status === 'UNDEFENDED' || dispute.status === 'UNRESPONDED') {
        additionalDisputeDetails.dispute.defensibility = allowedDefenseReasons ? 'DEFENDABLE' : 'DEFENDABLE_EXTERNALLY';
    } else {
        additionalDisputeDetails.dispute.defensibility = 'NOT_ACTIONABLE';
        additionalDisputeDetails.defense = {
            reason: 'ServicesProvided',
            suppliedDocuments: ['GoodsOrServicesProvided', 'WrittenRebuttal'],
            defendedOn: getDate(1, new Date(dispute.createdAt)),
            defendedThroughComponent: true,
        };
    }

    return { ...additionalDisputeDetails } as const;
};

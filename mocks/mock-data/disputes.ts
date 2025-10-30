import { BALANCE_ACCOUNTS } from './balanceAccounts';
import {
    IDispute,
    IDisputeDefenseDocument,
    IDisputeDetail,
    IDisputeListItem,
    IDisputeReasonCategory,
    IDisputeStatus,
    IDisputeStatusGroup,
    IDisputeType,
} from '../../src/types/api/models/disputes';

export const MAIN_BALANCE_ACCOUNT = BALANCE_ACCOUNTS.find(({ id }) => id === 'BA32272223222B5CTDQPM6W2H')!;

const DEFENDABLE_CHARGEBACK_REASONS: Record<string, Record<string, readonly IDisputeDefenseDocument[]>> = {
    '10.4': {
        AdditionalInformation: [
            { documentTypeCode: 'DefenseMaterial', requirementLevel: 'REQUIRED' } as const,
            { documentTypeCode: 'AdditionalInformation', requirementLevel: 'REQUIRED' } as const,
        ] as const,
    },
    '13.1': {
        InvalidChargeback: [{ documentTypeCode: 'InvalidChargeback', requirementLevel: 'OPTIONAL' } as const] as const,
        MerchandiseReceived: [
            { documentTypeCode: 'DateMerchandiseShipped', requirementLevel: 'REQUIRED' } as const,
            { documentTypeCode: 'ProofOfGoodsOrServicesProvided', requirementLevel: 'REQUIRED' } as const,
        ] as const,
        ServicesProvided: [{ documentTypeCode: 'ProofOfGoodsOrServicesProvided', requirementLevel: 'REQUIRED' } as const] as const,
    },
    '4837': {
        AirlineCompellingEvidence: [
            { documentTypeCode: 'CompellingEvidence', requirementLevel: 'REQUIRED' } as const,
            { documentTypeCode: 'AdditionalTransactions', requirementLevel: 'ONE_OR_MORE' } as const,
            { documentTypeCode: 'FlightManifest', requirementLevel: 'ONE_OR_MORE' } as const,
            { documentTypeCode: 'FlightTicket', requirementLevel: 'ONE_OR_MORE' } as const,
            { documentTypeCode: 'FlightTicketAtBillingAddress', requirementLevel: 'ONE_OR_MORE' } as const,
            { documentTypeCode: 'FrequentFlyer', requirementLevel: 'ONE_OR_MORE' } as const,
            { documentTypeCode: 'PassengerIdentification', requirementLevel: 'ONE_OR_MORE' } as const,
        ] as const,
        ChipAndPinLiabilityShift: [{ documentTypeCode: 'PrintedSignedTerminalReceipt', requirementLevel: 'REQUIRED' } as const] as const,
        ChipLiabilityShift: [{ documentTypeCode: 'PrintedSignedTerminalReceipt', requirementLevel: 'REQUIRED' } as const] as const,
        CompellingEvidence: [{ documentTypeCode: 'CardholderIdentification', requirementLevel: 'REQUIRED' } as const] as const,
        CVC2ValidationProgram: [{ documentTypeCode: 'PrintedSignedTerminalReceipt', requirementLevel: 'REQUIRED' } as const] as const,
        IdentifiedAddendum: [{ documentTypeCode: 'AddendumDocumentation', requirementLevel: 'REQUIRED' } as const] as const,
        InvalidChargeback: [{ documentTypeCode: 'InvalidChargeback', requirementLevel: 'OPTIONAL' } as const] as const,
        InvalidChargebackBundling: [{ documentTypeCode: 'InvalidChargeback', requirementLevel: 'REQUIRED' } as const] as const,
        NoShowTransaction: [{ documentTypeCode: 'ProofOfNoShow', requirementLevel: 'REQUIRED' } as const] as const,
        ProofOfCardPresenceAndSignatureChipNoPIN: [
            { documentTypeCode: 'PrintedSignedTerminalReceipt', requirementLevel: 'REQUIRED' } as const,
        ] as const,
        ProofOfCardPresenceAndSignatureNotMasterCardWorldWideNetwork: [
            { documentTypeCode: 'PrintedSignedTerminalReceipt', requirementLevel: 'REQUIRED' } as const,
        ] as const,
        ProofOfCardPresenceAndSignatureWithTerminalReceipt: [
            { documentTypeCode: 'PrintedSignedTerminalReceipt', requirementLevel: 'REQUIRED' } as const,
        ] as const,
        RecurringTransactionsCompellingEvidence: [{ documentTypeCode: 'CompellingEvidence', requirementLevel: 'REQUIRED' } as const] as const,
        RecurringTransactionsCompellingMerchantEvidence: [
            { documentTypeCode: 'MerchantProofOfRecurringTransaction', requirementLevel: 'OPTIONAL' } as const,
        ] as const,
        ShippedToAVS: [
            { documentTypeCode: 'PositiveAVS', requirementLevel: 'REQUIRED' } as const,
            { documentTypeCode: 'ShippedToAVS', requirementLevel: 'REQUIRED' } as const,
        ] as const,
        SupplyDefenseMaterial: [
            { documentTypeCode: 'DefenseMaterial', requirementLevel: 'REQUIRED' } as const,
            { documentTypeCode: 'TIDorInvoice', requirementLevel: 'OPTIONAL' } as const,
        ] as const,
    },
    '4853': {
        AirlineFlightProvided: [
            { documentTypeCode: 'FlightTicketUsed', requirementLevel: 'ONE_OR_MORE' } as const,
            { documentTypeCode: 'FligthTookPlace', requirementLevel: 'ONE_OR_MORE' } as const,
            { documentTypeCode: 'PaperAirlineTicket', requirementLevel: 'ONE_OR_MORE' } as const,
        ] as const,
        CancellationOrReturns: [
            { documentTypeCode: 'CancellationNeverAccepted', requirementLevel: 'ONE_OR_MORE' } as const,
            { documentTypeCode: 'GoodsNotReturned', requirementLevel: 'ONE_OR_MORE' } as const,
        ] as const,
        CancellationTermsFailed: [{ documentTypeCode: 'InvalidChargeback', requirementLevel: 'REQUIRED' } as const] as const,
        CreditOrCancellationPolicyProperlyDisclosed: [
            { documentTypeCode: 'DisclosureAtPointOfInteraction', requirementLevel: 'REQUIRED' } as const,
        ] as const,
        GoodsNotReturned: [
            { documentTypeCode: 'GoodsNotReturned', requirementLevel: 'REQUIRED' } as const,
            { documentTypeCode: 'TIDorInvoice', requirementLevel: 'OPTIONAL' } as const,
        ] as const,
        GoodsOrServicesProvided: [
            { documentTypeCode: 'ProofOfAbilityToProvideServices', requirementLevel: 'ONE_OR_MORE' } as const,
            { documentTypeCode: 'ProofOfGoodsOrServicesProvided', requirementLevel: 'ONE_OR_MORE' } as const,
        ] as const,
        GoodsRepairedOrReplaced: [
            { documentTypeCode: 'GoodsRepairedOrReplaced', requirementLevel: 'REQUIRED' } as const,
            { documentTypeCode: 'TIDorInvoice', requirementLevel: 'OPTIONAL' } as const,
        ] as const,
        GoodsWereAsDescribed: [
            { documentTypeCode: 'GoodsWereAsDescribed', requirementLevel: 'REQUIRED' } as const,
            { documentTypeCode: 'TIDorInvoice', requirementLevel: 'REQUIRED' } as const,
        ] as const,
        InvalidChargeback: [{ documentTypeCode: 'InvalidChargeback', requirementLevel: 'OPTIONAL' } as const] as const,
        InvalidChargebackBundling: [{ documentTypeCode: 'InvalidChargeback', requirementLevel: 'REQUIRED' } as const] as const,
        NotRecurring: [{ documentTypeCode: 'InvalidChargeback', requirementLevel: 'REQUIRED' } as const] as const,
        PaymentByOtherMeans: [{ documentTypeCode: 'PaymentByOtherMeans', requirementLevel: 'REQUIRED' } as const] as const,
        PurchaseProperlyPosted: [{ documentTypeCode: 'ProofOfRetailSaleRatherThanCredit', requirementLevel: 'REQUIRED' } as const] as const,
        ServicesProvidedAfterCancellation: [{ documentTypeCode: 'InvalidChargeback', requirementLevel: 'REQUIRED' } as const] as const,
        SupplyDefenseMaterial: [
            { documentTypeCode: 'DefenseMaterial', requirementLevel: 'REQUIRED' } as const,
            { documentTypeCode: 'TIDorInvoice', requirementLevel: 'OPTIONAL' } as const,
        ] as const,
    },
};

export const ACCEPTED_DISPUTES = new WeakMap<IDisputeListItem, { acceptedOn: string }>();

export const DEFENDED_DISPUTES = new WeakMap<
    IDisputeListItem,
    Pick<NonNullable<IDisputeDetail['defense']>, 'defendedOn' | 'reason' | 'suppliedDocuments'>
>();

// Issuer feedback
const LIABILITY_NOT_ACCEPTED_FULLY = 'Lorem ipsum this is a very long long text so we cut it here.';
const NOTE =
    'The documents submitted did not meet the requirements, unfortunately the dispute has been lost. Lorem ipsum this is a very long long text so we cut it here.';
const PRE_ARB_REASON =
    'The documents submitted did not meet the requirements, unfortunately the dispute has been lost. Lorem ipsum this is a very long long text so we cut it here.';

export const getAllowedDisputeDefenseReasons = <T extends Pick<IDispute, 'reason'>>(dispute: T) => {
    return Object.keys(DEFENDABLE_CHARGEBACK_REASONS[dispute.reason.code] || {}) as readonly string[];
};

export const getApplicableDisputeDefenseDocuments = <T extends Pick<IDispute, 'reason'>>(dispute: T, defenseReason: string) => {
    return DEFENDABLE_CHARGEBACK_REASONS[dispute.reason.code]?.[defenseReason] || ([] as const);
};

export const getDate = (daysOffset = 0, originDate = new Date()) => {
    const date = new Date(originDate);
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString();
};

const DEFAULT_DETAIL_DEFENSE: IDisputeDetail['defense'] = {
    autodefended: false,
    defendedOn: getDate(-1),
    defendedThroughComponent: true,
    reason: 'ServicesProvided',
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

export const CHARGEBACK_AUTO_DEFENDED: IDisputeDetail = {
    ...DEFAULT_DISPUTE_DETAIL,
    dispute: {
        ...DEFAULT_DETAIL_DISPUTE,
        status: 'WON',
        defensibility: 'NOT_ACTIONABLE',
    },
    defense: {
        autodefended: true,
        defendedThroughComponent: false,
        defendedOn: DEFAULT_DETAIL_DEFENSE.defendedOn,
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
        allowedDefenseReasons: [
            ...getAllowedDisputeDefenseReasons({
                reason: { category: 'CONSUMER_DISPUTE', code: '4853', title: '' },
            }),
        ],
    },
};

export const CHARGEBACK_NOT_DEFENDABLE: IDisputeDetail = {
    dispute: {
        ...DEFAULT_DETAIL_DISPUTE,
        defensibility: 'NOT_ACTIONABLE',
        status: 'UNDEFENDED',
    },
    payment: DEFAULT_DETAIL_PAYMENT,
};

export const CHARGEBACK_DEFENDABLE_EXTERNALLY: IDisputeDetail = {
    ...DEFAULT_DISPUTE_DETAIL,
    dispute: {
        ...DEFAULT_DETAIL_DISPUTE,
        dueDate: getDate(20),
        status: 'UNDEFENDED',
        defensibility: 'DEFENDABLE_EXTERNALLY',
    },
};

export const CHARGEBACK_DEFENDED: IDisputeDetail = {
    ...DEFAULT_DISPUTE_DETAIL,
    dispute: {
        ...DEFAULT_DETAIL_DISPUTE,
        dueDate: getDate(20),
        status: 'PENDING',
        defensibility: 'NOT_ACTIONABLE',
    },
    defense: {
        autodefended: false,
        defendedOn: '2025-06-05T12:54:39.000+00:00',
        defendedThroughComponent: true,
        reason: 'AdditionalInformation',
        suppliedDocuments: ['DefenseMaterial'],
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

export const CHARGEBACK_PENDING: IDisputeDetail = {
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

export const CHARGEBACK_LOST_WITH_ISSUER_FEEDBACK: IDisputeDetail = {
    ...DEFAULT_DISPUTE_DETAIL,
    dispute: {
        ...DEFAULT_DETAIL_DISPUTE,
        status: 'LOST',
        defensibility: 'NOT_ACTIONABLE',
        issuerExtraData: {
            chargeback: { LIABILITY_NOT_ACCEPTED_FULLY, NOTE },
            preArbitration: { PRE_ARB_REASON },
        },
    },
    defense: DEFAULT_DETAIL_DEFENSE,
};

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

export const RFI_ACCEPTABLE: IDisputeDetail = {
    ...DEFAULT_DISPUTE_DETAIL,
    dispute: {
        ...DEFAULT_DETAIL_DISPUTE,
        status: 'UNRESPONDED',
        type: 'REQUEST_FOR_INFORMATION',
        defensibility: 'ACCEPTABLE',
    },
};

export const RFI_ACCEPTED: IDisputeDetail = {
    ...DEFAULT_DISPUTE_DETAIL,
    dispute: {
        ...DEFAULT_DETAIL_DISPUTE,
        allowedDefenseReasons: [],
        status: 'EXPIRED',
        type: 'REQUEST_FOR_INFORMATION',
        defensibility: 'NOT_ACTIONABLE',
        acceptedDate: '2025-06-05T12:46:54.000+00:00',
        dueDate: undefined,
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

export const CHARGEBACKS = [
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000001',
        status: 'UNDEFENDED',
        dueDate: new Date(new Date().setHours(23)).toISOString(),
        createdAt: getDate(-10),
        paymentMethod: { type: 'mc', lastFourDigits: '0001', description: 'Mastercard' },
        reason: { category: 'CONSUMER_DISPUTE', code: '4853', title: 'Cardholder dispute - Defective / Not as described' },
        amount: { currency: 'EUR', value: 211100 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000002',
        status: 'UNRESPONDED',
        dueDate: new Date(new Date().setHours(20)).toISOString(),
        createdAt: getDate(-9),
        paymentMethod: { type: 'visa', lastFourDigits: '0002', description: 'Visa' },
        reason: { category: 'REQUEST_FOR_INFORMATION', code: '30', title: 'Cardholder/Seller dispute, cardholder/seller request for copy' },
        amount: { currency: 'USD', value: 222200 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000003',
        status: 'UNDEFENDED',
        dueDate: getDate(2),
        createdAt: getDate(-7),
        paymentMethod: { type: 'visa', lastFourDigits: '2004', description: 'Visa' },
        reason: { category: 'CONSUMER_DISPUTE', code: '13.1', title: 'Merchandise/Services Not Received' },
        amount: { currency: 'EUR', value: 233300 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000004',
        status: 'UNDEFENDED',
        dueDate: getDate(20),
        createdAt: getDate(-7),
        paymentMethod: { type: 'klarna', description: 'Klarna Pay Later' },
        reason: { category: 'CONSUMER_DISPUTE', code: 'faulty_goods', title: 'The user reported that he/she received a faulty good' },
        amount: { currency: 'USD', value: 244400 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000005',
        status: 'UNRESPONDED',
        dueDate: getDate(11),
        createdAt: getDate(-4),
        paymentMethod: { type: 'amex', lastFourDigits: '0005', description: 'American Express' },
        reason: { category: 'FRAUD', code: '684', title: 'Charge was paid by another form of payment.' },
        amount: { currency: 'USD', value: 255500 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000006',
        status: 'UNDEFENDED',
        dueDate: getDate(13),
        createdAt: getDate(-4),
        paymentMethod: { type: 'mc', lastFourDigits: '0006', description: 'Mastercard' },
        reason: { category: 'FRAUD', code: '4837', title: 'No Cardholder Authorisation' },
        amount: { currency: 'USD', value: 266600 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000007',
        status: 'UNRESPONDED',
        dueDate: getDate(15),
        createdAt: getDate(-3),
        paymentMethod: { type: 'visa', lastFourDigits: '0007', description: 'Visa' },
        reason: { category: 'REQUEST_FOR_INFORMATION', code: '29', title: 'Request for draft of vehicle leasing or airline transaction' },
        amount: { currency: 'EUR', value: 277700 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000008',
        status: 'UNRESPONDED',
        dueDate: getDate(16),
        createdAt: getDate(-3),
        paymentMethod: { type: 'paypal', description: 'PayPal' },
        reason: {
            category: 'REQUEST_FOR_INFORMATION',
            code: 'PAYMENT_BY_OTHER_MEANS',
            title: 'The customer paid for the transaction through other means.',
        },
        amount: { currency: 'USD', value: 288800 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000009',
        status: 'UNRESPONDED',
        dueDate: getDate(18),
        createdAt: getDate(-3),
        paymentMethod: { type: 'klarna', description: 'Klarna Pay Later' },
        reason: { category: 'CONSUMER_DISPUTE', code: 'incorrect_invoice', title: 'The user informed that the invoice is incorrect' },
        amount: { currency: 'EUR', value: 299900 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000010',
        status: 'UNDEFENDED',
        dueDate: getDate(20),
        createdAt: getDate(-2),
        paymentMethod: { type: 'amex', lastFourDigits: '0010', description: 'American Express' },
        reason: { category: 'PROCESSING_ERROR', code: '4512', title: 'Multiple Processing' },
        amount: { currency: 'USD', value: 311000 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000011',
        status: 'UNDEFENDED',
        dueDate: getDate(22),
        createdAt: getDate(-2),
        paymentMethod: { type: 'mc', lastFourDigits: '0011', description: 'Mastercard' },
        reason: { category: 'AUTHORISATION_ERROR', code: '4809', title: 'Transaction Not Reconciled' },
        amount: { currency: 'EUR', value: 322100 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000012',
        status: 'UNDEFENDED',
        dueDate: getDate(23),
        createdAt: getDate(-2),
        paymentMethod: { type: 'visa', lastFourDigits: '0012', description: 'Visa' },
        reason: { category: 'PROCESSING_ERROR', code: '12.6', title: 'Duplicate Processing/Paid by Other Means' },
        amount: { currency: 'USD', value: 333200 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000013',
        status: 'UNDEFENDED',
        dueDate: getDate(26),
        createdAt: getDate(-2),
        paymentMethod: { type: 'paypal', description: 'PayPal' },
        reason: {
            category: 'OTHER',
            code: 'CANCELED_RECURRING_BILLING',
            title: 'The customer was incorrectly charged because he or she canceled recurring billing.',
        },
        amount: { currency: 'EUR', value: 344300 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000014',
        status: 'UNDEFENDED',
        dueDate: getDate(29),
        createdAt: getDate(-1),
        paymentMethod: { type: 'klarna', description: 'Klarna Pay Later' },
        reason: { category: 'CONSUMER_DISPUTE', code: 'return', title: 'The user reported that a full/partial return was made' },
        amount: { currency: 'USD', value: 355400 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000015',
        status: 'UNRESPONDED',
        dueDate: getDate(30),
        createdAt: getDate(-2),
        paymentMethod: { type: 'amex', lastFourDigits: '0015', description: 'American Express' },
        reason: { category: 'REQUEST_FOR_INFORMATION', code: '62', title: 'Referenced Charge should have been submitted as a credit.' },
        amount: { currency: 'USD', value: 366500 },
    },
] satisfies Readonly<IDisputeListItem[]>;

export const ALL_DISPUTES = [
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000016',
        status: 'PENDING',
        createdAt: getDate(-3),
        paymentMethod: { type: 'mc', lastFourDigits: '0016', description: 'Mastercard' },
        reason: { category: 'CONSUMER_DISPUTE', code: '4879', title: 'Goods or Service Not Provided' },
        amount: { currency: 'USD', value: 377600 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000017',
        status: 'EXPIRED',
        dueDate: getDate(-1),
        createdAt: getDate(-3),
        paymentMethod: { type: 'visa', lastFourDigits: '0017', description: 'Visa' },
        reason: { category: 'OTHER', code: 'unknownRFI', title: 'Unknown Request for Information' },
        amount: { currency: 'EUR', value: 388700 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000018',
        status: 'ACCEPTED',
        createdAt: getDate(-3),
        paymentMethod: { type: 'paypal', description: 'PayPal' },
        reason: {
            category: 'CONSUMER_DISPUTE',
            code: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
            title: 'The customer did not receive the merchandise or service.',
        },
        amount: { currency: 'USD', value: 399800 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000019',
        status: 'WON',
        createdAt: getDate(-3),
        paymentMethod: { type: 'klarna', description: 'Klarna Pay Later' },
        reason: { category: 'CONSUMER_DISPUTE', code: 'faulty_goods', title: 'The user reported that he/she received a faulty good' },
        amount: { currency: 'EUR', value: 410900 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000020',
        status: 'LOST',
        createdAt: getDate(-5),
        paymentMethod: { type: 'amex', lastFourDigits: '0020', description: 'American Express' },
        reason: { category: 'CONSUMER_DISPUTE', code: '4532', title: 'Damaged and/or Defective Goods/Services' },
        amount: { currency: 'USD', value: 422000 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000021',
        status: 'PENDING',
        createdAt: getDate(-5),
        paymentMethod: { type: 'mc', lastFourDigits: '0021', description: 'Mastercard' },
        reason: { category: 'CONSUMER_DISPUTE', code: '4853', title: 'Cardholder dispute - Defective / Not as described' },
        amount: { currency: 'EUR', value: 433100 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000022',
        status: 'WON',
        createdAt: getDate(-5),
        paymentMethod: { type: 'visa', lastFourDigits: '0022', description: 'Visa' },
        reason: { category: 'FRAUD', code: '10.4', title: 'Other Fraud-Card Absent Environment' },
        amount: { currency: 'USD', value: 444200 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000024',
        status: 'LOST',
        createdAt: getDate(-6),
        paymentMethod: { type: 'klarna', description: 'Klarna Pay Later' },
        reason: { category: 'OTHER', code: 'unauthorized_purchase', title: 'The user informs that he/she did not made the purchase' },
        amount: { currency: 'USD', value: 466400 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000025',
        status: 'EXPIRED',
        dueDate: getDate(-2),
        createdAt: getDate(-6),
        paymentMethod: { type: 'amex', lastFourDigits: '0025', description: 'American Express' },
        reason: { category: 'OTHER', code: '6008', title: 'C/M Requests Copy Bearing Signature' },
        amount: { currency: 'EUR', value: 477500 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000026',
        status: 'PENDING',
        createdAt: getDate(-8),
        paymentMethod: { type: 'mc', lastFourDigits: '0026', description: 'Mastercard' },
        reason: { category: 'FRAUD', code: '4837', title: 'No Cardholder Authorisation' },
        amount: { currency: 'USD', value: 488600 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000027',
        status: 'LOST',
        createdAt: getDate(-8),
        paymentMethod: { type: 'visa', lastFourDigits: '0027', description: 'Visa' },
        reason: { category: 'CONSUMER_DISPUTE', code: '13.1', title: 'Merchandise/Services Not Received' },
        amount: { currency: 'EUR', value: 499700 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000031',
        status: 'WON',
        createdAt: getDate(-12),
        paymentMethod: { type: 'visa', lastFourDigits: '0031', description: 'Visa' },
        reason: { category: 'CONSUMER_DISPUTE', code: '30', title: 'Services Not Rendered' },
        amount: { currency: 'EUR', value: 244100 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000033',
        status: 'ACCEPTED',
        createdAt: getDate(-12),
        paymentMethod: { type: 'mc', lastFourDigits: '0033', description: 'Mastercard' },
        reason: { category: 'PROCESSING_ERROR', code: '4873', title: 'Duplicate Processing' },
        amount: { currency: 'EUR', value: 266300 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000034',
        status: 'EXPIRED',
        dueDate: getDate(-5),
        createdAt: getDate(-12),
        paymentMethod: { type: 'visa', lastFourDigits: '0034', description: 'Visa' },
        reason: { category: 'REQUEST_FOR_INFORMATION', code: '29', title: 'Request for draft of vehicle leasing or airline transaction' },
        amount: { currency: 'USD', value: 277400 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000038',
        status: 'LOST',
        createdAt: getDate(-15),
        paymentMethod: { type: 'paypal', description: 'PayPal' },
        reason: { category: 'CONSUMER_DISPUTE', code: 'DUPLICATE_TRANSACTION', title: 'The transaction was a duplicate.' },
        amount: { currency: 'USD', value: 321800 },
    },
] satisfies Readonly<IDisputeListItem[]>;

export const FRAUD_ALERTS = [
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000041',
        status: 'LOST',
        createdAt: getDate(-10),
        paymentMethod: { type: 'mc', lastFourDigits: '0001', description: 'Mastercard' },
        reason: { category: 'FRAUD', code: '1', title: 'Card Reported Stolen' },
        amount: { currency: 'EUR', value: 211100 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000042',
        status: 'LOST',
        createdAt: getDate(-10),
        paymentMethod: { type: 'amex', lastFourDigits: '3201', description: 'American Express' },
        reason: { category: 'FRAUD', code: '6006', title: 'Fraud Analysis' },
        amount: { currency: 'USD', value: 233300 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000043',
        status: 'LOST',
        createdAt: getDate(-9),
        paymentMethod: { type: 'amex', lastFourDigits: '1044', description: 'American Express' },
        reason: { category: 'FRAUD', code: '193', title: 'Fraudulent charge.' },
        amount: { currency: 'USD', value: 255500 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000044',
        status: 'LOST',
        createdAt: getDate(-7),
        paymentMethod: { type: 'visa', lastFourDigits: '2100', description: 'Visa' },
        reason: { category: 'FRAUD', code: '32', title: 'Cardholder does not recognise Transaction' },
        amount: { currency: 'USD', value: 222200 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000045',
        status: 'LOST',
        createdAt: getDate(-7),
        paymentMethod: { type: 'mc', lastFourDigits: '0066', description: 'Mastercard' },
        reason: { category: 'FRAUD', code: '6', title: 'Card Not Present Fraud' },
        amount: { currency: 'EUR', value: 244400 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000046',
        status: 'LOST',
        createdAt: getDate(-4),
        paymentMethod: { type: 'mc', lastFourDigits: '0066', description: 'Mastercard' },
        reason: { category: 'FRAUD', code: '6', title: 'Card Not Present Fraud' },
        amount: { currency: 'EUR', value: 266600 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000047',
        status: 'LOST',
        createdAt: getDate(-3),
        paymentMethod: { type: 'klarna', description: 'Klarna Pay Later' },
        reason: {
            category: 'OTHER',
            code: 'high_risk_order',
            title: "Klarna's internal alarm and flagging systems have identified a potential high risk in the order",
        },
        amount: { currency: 'USD', value: 200000 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000048',
        status: 'LOST',
        createdAt: getDate(-3),
        paymentMethod: { type: 'visa', lastFourDigits: '0007', description: 'Visa' },
        reason: { category: 'FRAUD', code: '6', title: 'Fraudulent Use of Account Number' },
        amount: { currency: 'EUR', value: 577700 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000049',
        status: 'LOST',
        createdAt: getDate(-3),
        paymentMethod: { type: 'klarna', description: 'Klarna Pay Later' },
        reason: { category: 'OTHER', code: 'unauthorized_purchase', title: 'The user informs that he/she did not make the purchase' },
        amount: { currency: 'EUR', value: 299900 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000050',
        status: 'LOST',
        createdAt: getDate(-2),
        paymentMethod: { type: 'amex', lastFourDigits: '0010', description: 'American Express' },
        reason: { category: 'FRAUD', code: '127', title: 'Unrecognizable charge. Credit/Explanation requested.' },
        amount: { currency: 'USD', value: 311000 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000051',
        status: 'LOST',
        createdAt: getDate(-2),
        paymentMethod: { type: 'mc', lastFourDigits: '0011', description: 'Mastercard' },
        reason: { category: 'FRAUD', code: '6321', title: 'Cardholder does not recognise' },
        amount: { currency: 'EUR', value: 412000 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000052',
        status: 'LOST',
        createdAt: getDate(-2),
        paymentMethod: { type: 'visa', lastFourDigits: '0012', description: 'Visa' },
        reason: { category: 'FRAUD', code: '6', title: 'Fraudulent Use of Account Number' },
        amount: { currency: 'USD', value: 911200 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000053',
        status: 'LOST',
        createdAt: getDate(-2),
        paymentMethod: { type: 'klarna', description: 'Klarna Pay Later' },
        reason: {
            category: 'OTHER',
            code: 'high_risk_order',
            title: "Klarna's internal alarm and flagging systems have identified a potential high risk in the order",
        },
        amount: { currency: 'EUR', value: 344300 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000054',
        status: 'LOST',
        createdAt: getDate(-1),
        paymentMethod: { type: 'klarna', description: 'Klarna Pay Later' },
        reason: {
            category: 'OTHER',
            code: 'high_risk_order',
            title: "Klarna's internal alarm and flagging systems have identified a potential high risk in the order",
        },
        amount: { currency: 'USD', value: 755400 },
    },
    {
        disputePspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000055',
        status: 'LOST',
        createdAt: getDate(0),
        paymentMethod: { type: 'amex', lastFourDigits: '0015', description: 'American Express' },
        reason: { category: 'FRAUD', code: '193', title: 'Fraudulent charge.' },
        amount: { currency: 'USD', value: 510500 },
    },
] satisfies Readonly<IDisputeListItem[]>;

export const DISPUTES = [...CHARGEBACKS, ...ALL_DISPUTES, ...FRAUD_ALERTS] as Readonly<IDisputeListItem[]>;

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

const AUTO_DEFENDABLE_CHARGEBACK_REASONS: IDisputeReasonCategory[] = ['ADJUSTMENT', 'AUTHORISATION_ERROR'];
const ACCEPTABLE_CHARGEBACK_REASONS: IDisputeReasonCategory[] = ['CONSUMER_DISPUTE', 'FRAUD', 'PROCESSING_ERROR'];
const ACCEPTED_OR_EXPIRED_STATUSES: IDisputeStatus[] = ['ACCEPTED', 'EXPIRED'];
const ACTION_NEEDED_STATUSES: IDisputeStatus[] = ['UNDEFENDED', 'UNRESPONDED'];
const RFI_ONLY_STATUSES: IDisputeStatus[] = ['EXPIRED', 'RESPONDED', 'UNRESPONDED'];

const getDisputeDefense = <T extends Pick<IDisputeListItem, 'reason' | 'disputePspReference'>>(dispute: T) => {
    let reason = 'ServicesProvided';
    const suppliedDocuments: string[] = ['GoodsOrServicesProvided', 'WrittenRebuttal'];

    const allowedReasons = getAllowedDisputeDefenseReasons(dispute);
    const allowedReasonsCount = allowedReasons.length;

    if (allowedReasonsCount) {
        let includedOneOrMoreDocument = false;
        const idBucket = parseInt(dispute.disputePspReference.match(/\d(?=\D*$)/g)?.[0] ?? '0') % allowedReasonsCount;
        const optionalDocuments: string[] = [];

        reason = allowedReasons[idBucket]!;
        suppliedDocuments.length = 0;

        for (const document of getApplicableDisputeDefenseDocuments(dispute, reason)) {
            if (document.requirementLevel === 'OPTIONAL') {
                optionalDocuments.push(document.documentTypeCode);
                continue;
            }
            if (document.requirementLevel === 'ONE_OR_MORE') {
                if (includedOneOrMoreDocument) continue;
                includedOneOrMoreDocument = true;
            }
            suppliedDocuments.push(document.documentTypeCode);
        }

        if (suppliedDocuments.length === 0 && optionalDocuments.length > 0) {
            suppliedDocuments.push(optionalDocuments[0]!);
        }
    }

    return { reason, suppliedDocuments };
};

export const getAdditionalDisputeDetails = <T extends IDisputeListItem>(dispute: T) => {
    const { disputePspReference, ...disputeProps } = dispute;
    const disputeCategory = dispute.reason.category;
    const disputeStatus = dispute.status;

    const disputeType: IDisputeType = FRAUD_ALERTS.includes(dispute as any)
        ? 'NOTIFICATION_OF_FRAUD'
        : RFI_ONLY_STATUSES.includes(disputeStatus) || disputeCategory === 'REQUEST_FOR_INFORMATION'
          ? 'REQUEST_FOR_INFORMATION'
          : 'CHARGEBACK';

    const disputeModificationDate = getDate(1, new Date(dispute.createdAt));

    const actionNeeded = ACTION_NEEDED_STATUSES.includes(disputeStatus);
    const isAcceptableChargeback = ACCEPTABLE_CHARGEBACK_REASONS.includes(disputeCategory);
    const isAcceptedOrExpired = ACCEPTED_OR_EXPIRED_STATUSES.includes(disputeStatus);
    const isAutoDefendableChargeback = AUTO_DEFENDABLE_CHARGEBACK_REASONS.includes(disputeCategory);
    const isDefendableThroughComponent = Object.hasOwn(DEFENDABLE_CHARGEBACK_REASONS, dispute.reason.code);

    const isChargeback = disputeType === 'CHARGEBACK';
    const isFraudAlert = disputeType === 'NOTIFICATION_OF_FRAUD';
    const isRequestForInformation = disputeType === 'REQUEST_FOR_INFORMATION';

    const hasDefenseEvidence = !isFraudAlert && !actionNeeded && !isAcceptedOrExpired;
    const hasIssuerFeedback = !isFraudAlert && disputeStatus === 'LOST' && hasDefenseEvidence && isDefendableThroughComponent;

    let defensibility: IDisputeDetail['dispute']['defensibility'] = isFraudAlert ? 'DEFENDABLE_EXTERNALLY' : 'NOT_ACTIONABLE';

    if (actionNeeded) {
        if (isRequestForInformation) defensibility = 'DEFENDABLE_EXTERNALLY';
        else if (isDefendableThroughComponent) defensibility = 'DEFENDABLE';
        else if (isAcceptableChargeback) defensibility = 'ACCEPTABLE';
        else defensibility = 'DEFENDABLE_EXTERNALLY';
    }

    const additionalDisputeDetails = {} as Omit<IDisputeDetail, 'dispute'> & { dispute: IDisputeDetail['dispute'] };

    if (hasDefenseEvidence) {
        const disputeDefenseData = DEFENDED_DISPUTES.get(dispute);

        additionalDisputeDetails.defense = {
            autodefended: isAutoDefendableChargeback,
            defendedOn: disputeModificationDate,
            defendedThroughComponent: !isAutoDefendableChargeback && !!disputeDefenseData,
            ...(!isAutoDefendableChargeback && (disputeDefenseData ?? getDisputeDefense(dispute))),
        };
    }

    additionalDisputeDetails.dispute = {
        ...disputeProps,
        defensibility,
        allowedDefenseReasons: [...getAllowedDisputeDefenseReasons(dispute)],
        pspReference: disputePspReference,
        type: disputeType,
        ...(disputeStatus === 'ACCEPTED' && {
            acceptedDate: ACCEPTED_DISPUTES.get(dispute)?.acceptedOn ?? disputeModificationDate,
        }),
        ...(hasIssuerFeedback && {
            issuerExtraData: {
                ...(isChargeback && {
                    chargeback: { LIABILITY_NOT_ACCEPTED_FULLY, NOTE },
                }),
                preArbitration: { PRE_ARB_REASON },
            },
        }),
    };

    additionalDisputeDetails.payment = {
        balanceAccount: {
            description: MAIN_BALANCE_ACCOUNT.description ?? MAIN_BALANCE_ACCOUNT.id,
            timeZone: MAIN_BALANCE_ACCOUNT.timeZone,
        },
        isRefunded: false,
        merchantReference: '92034523KKL',
        paymentMethod: dispute.paymentMethod,
        pspReference: 'KLAHFUW1329523KKL',
    };

    return { ...additionalDisputeDetails } as const;
};

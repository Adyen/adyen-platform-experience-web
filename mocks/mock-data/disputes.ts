import { IDispute, IDisputeDefenseDocument, IDisputeDetail } from '../../src/types/api/models/disputes';

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

export const DISPUTES = [
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000001',
        status: 'action_needed',
        dueDate: new Date(new Date().setHours(23)).toISOString(),
        createdAt: getDate(-10),
        paymentMethod: { type: 'mc', lastFourDigits: '0001', description: 'MasterCard' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 211100 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000002',
        status: 'action_needed',
        dueDate: new Date(new Date().setHours(20)).toISOString(),
        createdAt: getDate(-9),
        paymentMethod: { type: 'visa', lastFourDigits: '0002', description: 'Visa Credit Card' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 222200 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000003',
        status: 'action_needed',
        dueDate: getDate(2),
        createdAt: getDate(-7),
        paymentMethod: { type: 'paypal', lastFourDigits: '0003', description: 'PayPal' },
        reasonGroup: 'other',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 233300 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000004',
        status: 'action_needed',
        dueDate: getDate(20),
        createdAt: getDate(-7),
        paymentMethod: { type: 'klarna', lastFourDigits: '0004', description: 'Klarna Pay Later' },
        reasonGroup: 'consumer',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 244400 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000005',
        status: 'action_needed',
        dueDate: getDate(11),
        createdAt: getDate(-4),
        paymentMethod: { type: 'amex', lastFourDigits: '0005', description: 'American Express' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 255500 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000006',
        status: 'action_needed',
        dueDate: getDate(13),
        createdAt: getDate(-4),
        paymentMethod: { type: 'mc', lastFourDigits: '0006', description: 'MasterCard' },
        reasonGroup: 'consumer',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 266600 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000007',
        status: 'action_needed',
        dueDate: getDate(15),
        createdAt: getDate(-3),
        paymentMethod: { type: 'visa', lastFourDigits: '0007', description: 'Visa Credit Card' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 277700 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000008',
        status: 'action_needed',
        dueDate: getDate(16),
        createdAt: getDate(-3),
        paymentMethod: { type: 'paypal', lastFourDigits: '0008', description: 'PayPal' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 288800 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000009',
        status: 'action_needed',
        dueDate: getDate(18),
        createdAt: getDate(-3),
        paymentMethod: { type: 'klarna', lastFourDigits: '0009', description: 'Klarna Pay Later' },
        reasonGroup: 'other',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 299900 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000010',
        status: 'action_needed',
        dueDate: getDate(20),
        createdAt: getDate(-2),
        paymentMethod: { type: 'amex', lastFourDigits: '0010', description: 'American Express' },
        reasonGroup: 'other',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 311000 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000011',
        status: 'action_needed',
        dueDate: getDate(22),
        createdAt: getDate(-2),
        paymentMethod: { type: 'mc', lastFourDigits: '0011', description: 'MasterCard' },
        reasonGroup: 'consumer',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 322100 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000012',
        status: 'action_needed',
        dueDate: getDate(23),
        createdAt: getDate(-2),
        paymentMethod: { type: 'visa', lastFourDigits: '0012', description: 'Visa Credit Card' },
        reasonGroup: 'consumer',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 333200 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000013',
        status: 'action_needed',
        dueDate: getDate(26),
        createdAt: getDate(-2),
        paymentMethod: { type: 'paypal', lastFourDigits: '0013', description: 'PayPal' },
        reasonGroup: 'other',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 344300 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000014',
        status: 'action_needed',
        dueDate: getDate(29),
        createdAt: getDate(-1),
        paymentMethod: { type: 'klarna', lastFourDigits: '0014', description: 'Klarna Pay Later' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 355400 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000015',
        status: 'action_needed',
        dueDate: getDate(30),
        createdAt: getDate(-2),
        paymentMethod: { type: 'amex', lastFourDigits: '0015', description: 'American Express' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 366500 },
    },

    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000016',
        status: 'under_review',
        createdAt: getDate(-3),
        paymentMethod: { type: 'mc', lastFourDigits: '0016', description: 'MasterCard' },
        reasonGroup: 'other',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 377600 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000017',
        status: 'under_review',
        createdAt: getDate(-3),
        paymentMethod: { type: 'visa', lastFourDigits: '0017', description: 'Visa Credit Card' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 388700 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000018',
        status: 'under_review',
        createdAt: getDate(-3),
        paymentMethod: { type: 'paypal', lastFourDigits: '0018', description: 'PayPal' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 399800 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000019',
        status: 'under_review',
        createdAt: getDate(-3),
        paymentMethod: { type: 'klarna', lastFourDigits: '0019', description: 'Klarna Pay Later' },
        reasonGroup: 'other',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 410900 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000020',
        status: 'under_review',
        createdAt: getDate(-5),
        paymentMethod: { type: 'amex', lastFourDigits: '0020', description: 'American Express' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 422000 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000021',
        status: 'under_review',
        createdAt: getDate(-5),
        paymentMethod: { type: 'mc', lastFourDigits: '0021', description: 'MasterCard' },
        reasonGroup: 'consumer',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 433100 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000022',
        status: 'under_review',
        createdAt: getDate(-5),
        paymentMethod: { type: 'visa', lastFourDigits: '0022', description: 'Visa Credit Card' },
        reasonGroup: 'other',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 444200 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000023',
        status: 'under_review',
        createdAt: getDate(-6),
        paymentMethod: { type: 'paypal', lastFourDigits: '0023', description: 'PayPal' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 455300 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000024',
        status: 'under_review',
        createdAt: getDate(-6),
        paymentMethod: { type: 'klarna', lastFourDigits: '0024', description: 'Klarna Pay Later' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 466400 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000025',
        status: 'under_review',
        createdAt: getDate(-6),
        paymentMethod: { type: 'amex', lastFourDigits: '0025', description: 'American Express' },
        reasonGroup: 'other',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 477500 },
    },

    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000026',
        status: 'won',
        createdAt: getDate(-8),
        paymentMethod: { type: 'mc', lastFourDigits: '0026', description: 'MasterCard' },
        reasonGroup: 'other',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 488600 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000027',
        status: 'lost',
        createdAt: getDate(-8),
        paymentMethod: { type: 'visa', lastFourDigits: '0027', description: 'Visa Credit Card' },
        reasonGroup: 'consumer',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 499700 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000028',
        status: 'lost',
        createdAt: getDate(-8),
        paymentMethod: { type: 'paypal', lastFourDigits: '0028', description: 'PayPal' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 210800 },
    },
    {
        id: getDate(-8),
        status: 'lost',
        createdAt: '2025-02-04T11:00:00.000Z',
        paymentMethod: { type: 'amex', lastFourDigits: '0029', description: 'American Express' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 221900 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000030',
        status: 'won',
        createdAt: getDate(-8),
        paymentMethod: { type: 'mc', lastFourDigits: '0030', description: 'MasterCard' },
        reasonGroup: 'other',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 233000 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000031',
        status: 'won',
        createdAt: getDate(-12),
        paymentMethod: { type: 'visa', lastFourDigits: '0031', description: 'Visa Credit Card' },
        reasonGroup: 'other',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 244100 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000032',
        status: 'won',
        createdAt: '2025-02-07T11:00:00.000Z',
        paymentMethod: { type: 'paypal', lastFourDigits: '0032', description: 'PayPal' },
        reasonGroup: 'consumer',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 255200 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000033',
        status: 'lost',
        createdAt: getDate(-12),
        paymentMethod: { type: 'mc', lastFourDigits: '0033', description: 'MasterCard' },
        reasonGroup: 'other',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 266300 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000034',
        status: 'won',
        createdAt: getDate(-12),
        paymentMethod: { type: 'visa', lastFourDigits: '0034', description: 'Visa Credit Card' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 277400 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000035',
        status: 'won',
        createdAt: getDate(-12),
        paymentMethod: { type: 'paypal', lastFourDigits: '0035', description: 'PayPal' },
        reasonGroup: 'other',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 288500 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000036',
        status: 'won',
        createdAt: getDate(-15),
        paymentMethod: { type: 'mc', lastFourDigits: '0036', description: 'MasterCard' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 299600 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000037',
        status: 'won',
        createdAt: getDate(-15),
        paymentMethod: { type: 'visa', lastFourDigits: '0037', description: 'Visa Credit Card' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 310700 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000038',
        status: 'lost',
        createdAt: getDate(-15),
        paymentMethod: { type: 'paypal', lastFourDigits: '0038', description: 'PayPal' },
        reasonGroup: 'consumer',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 321800 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000039',
        status: 'lost',
        createdAt: getDate(-15),
        paymentMethod: { type: 'mc', lastFourDigits: '0039', description: 'MasterCard' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 332900 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000040',
        status: 'lost',
        createdAt: getDate(-15),
        paymentMethod: { type: 'visa', lastFourDigits: '0040', description: 'Visa Credit Card' },
        reasonGroup: 'consumer',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 344000 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000041',
        status: 'lost',
        createdAt: getDate(-15),
        paymentMethod: { type: 'mc', lastFourDigits: '0041', description: 'MasterCard' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 355100 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000042',
        status: 'lost',
        createdAt: getDate(-15),
        paymentMethod: { type: 'visa', lastFourDigits: '0042', description: 'Visa Credit Card' },
        reasonGroup: 'other',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 366200 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000043',
        status: 'lost',
        createdAt: getDate(-18),
        paymentMethod: { type: 'mc', lastFourDigits: '0043', description: 'MasterCard' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 377300 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000044',
        status: 'lost',
        createdAt: getDate(-18),
        paymentMethod: { type: 'visa', lastFourDigits: '0044', description: 'Visa Credit Card' },
        reasonGroup: 'consumer',
        reasonCode: '4835',
        amount: { currency: 'USD', value: 388400 },
    },
    {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000045',
        status: 'won',
        createdAt: getDate(-18),
        paymentMethod: { type: 'mc', lastFourDigits: '0045', description: 'MasterCard' },
        reasonGroup: 'fraudulent',
        reasonCode: '4835',
        amount: { currency: 'EUR', value: 399500 },
    },
] as const satisfies Readonly<IDispute[]>;

export const getAllowedDisputeDefenseReasons = (dispute: (typeof DISPUTES)[number]) => {
    switch (dispute.paymentMethod.type) {
        case 'mc': {
            if (dispute.reasonGroup === 'consumer') return MC_CONSUMER_DEFENSE_REASONS;
            if (dispute.reasonGroup === 'fraudulent') return MC_FRAUD_DEFENSE_REASONS;
            break;
        }
        case 'visa': {
            if (dispute.reasonGroup === 'consumer') return VISA_CONSUMER_DEFENSE_REASONS;
            if (dispute.reasonGroup === 'fraudulent') return VISA_FRAUD_DEFENSE_REASONS;
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
            if (dispute.reasonGroup === 'consumer') {
                switch (disputeDefenseReason) {
                    case 'AirlineFlightProvided':
                        return [
                            { type: 'FlightTicketUsed', requirement: 'one_or_more' } as const,
                            { type: 'FlightTookPlace', requirement: 'one_or_more' } as const,
                            { type: 'PaperAirlineTicket', requirement: 'one_or_more' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'CancellationOrReturns':
                        return [
                            { type: 'CancellationNeverAccepted', requirement: 'one_or_more' } as const,
                            { type: 'GoodsNotReturned', requirement: 'one_or_more' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'CancellationTermsFailed':
                    case 'InvalidChargebackBundling':
                    case 'NotRecurring':
                    case 'ServicesProvidedAfterCancellation':
                        return [{ type: 'InvalidChargeback', requirement: 'required' } as const] satisfies IDisputeDefenseDocument[];

                    case 'CreditOrCancellationPolicyProperlyDisclosed':
                        return [{ type: 'DisclosureAtPointOfInteraction', requirement: 'required' } as const] satisfies IDisputeDefenseDocument[];

                    case 'GoodsNotReturned':
                        return [
                            { type: 'GoodsNotReturned', requirement: 'required' } as const,
                            { type: 'TIDorInvoice', requirement: 'optional' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'GoodsOrServicesProvided':
                        return [
                            { type: 'ProofOfAbilityToProvideServices', requirement: 'one_or_more' } as const,
                            { type: 'ProofOfGoodsOrServicesProvided', requirement: 'one_or_more' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'GoodsRepairedOrReplaced':
                        return [
                            { type: 'GoodsRepairedOrReplaced', requirement: 'required' } as const,
                            { type: 'TIDorInvoice', requirement: 'optional' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'GoodsWereAsDescribed':
                        return [
                            { type: 'GoodsWereAsDescribed', requirement: 'required' } as const,
                            { type: 'TIDorInvoice', requirement: 'required' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'InvalidChargeback':
                        return [{ type: 'InvalidChargeback', requirement: 'optional' } as const] satisfies IDisputeDefenseDocument[];

                    case 'PaymentByOtherMeans':
                        return [{ type: 'PaymentByOtherMeans', requirement: 'required' } as const] satisfies IDisputeDefenseDocument[];

                    case 'PurchaseProperlyPosted':
                        return [{ type: 'ProofOfRetailSaleRatherThanCredit', requirement: 'required' } as const] satisfies IDisputeDefenseDocument[];

                    case 'SupplyDefenseMaterial':
                        return [
                            { type: 'DefenseMaterial', requirement: 'required' } as const,
                            { type: 'TIDorInvoice', requirement: 'optional' } as const,
                        ] satisfies IDisputeDefenseDocument[];
                }
            } else if (dispute.reasonGroup === 'fraudulent') {
                switch (disputeDefenseReason) {
                    case 'AirlineCompellingEvidence':
                        return [
                            { type: 'CompellingEvidence', requirement: 'required' } as const,
                            { type: 'AdditionalTransactions', requirement: 'one_or_more' } as const,
                            { type: 'FlightManifest', requirement: 'one_or_more' } as const,
                            { type: 'FlightTicket', requirement: 'one_or_more' } as const,
                            { type: 'FlightTicketAtBillingAddress', requirement: 'one_or_more' } as const,
                            { type: 'FrequentFlyer', requirement: 'one_or_more' } as const,
                            { type: 'PassengerIdentification', requirement: 'one_or_more' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'ChipAndPinLiabilityShift':
                    case 'ChipLiabilityShift':
                    case 'CVC2ValidationProgram':
                    case 'ProofOfCardPresenceAndSignatureChipNoPIN':
                    case 'ProofOfCardPresenceAndSignatureNotMasterCardWorldWideNetwork':
                    case 'ProofOfCardPresenceAndSignatureWithTerminalReceipt':
                        return [{ type: 'PrintedSignedTerminalReceipt', requirement: 'required' } as const] satisfies IDisputeDefenseDocument[];

                    case 'CompellingEvidence':
                        return [{ type: 'CardholderIdentification', requirement: 'required' } as const] satisfies IDisputeDefenseDocument[];

                    case 'IdentifiedAddendum':
                        return [{ type: 'AddendumDocumentation', requirement: 'required' } as const] satisfies IDisputeDefenseDocument[];

                    case 'InvalidChargeback':
                        return [{ type: 'InvalidChargeback', requirement: 'optional' } as const] satisfies IDisputeDefenseDocument[];

                    case 'InvalidChargebackBundling':
                        return [{ type: 'InvalidChargeback', requirement: 'required' } as const] satisfies IDisputeDefenseDocument[];

                    case 'NoShowTransaction':
                        return [{ type: 'ProofOfNoShow', requirement: 'required' } as const] satisfies IDisputeDefenseDocument[];

                    case 'RecurringTransactionsCompellingEvidence':
                        return [{ type: 'CompellingEvidence', requirement: 'required' } as const] satisfies IDisputeDefenseDocument[];

                    case 'RecurringTransactionsCompellingMerchantEvidence':
                        return [
                            { type: 'MerchantProofOfRecurringTransaction', requirement: 'optional' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'ShippedToAVS':
                        return [
                            { type: 'PositiveAVS', requirement: 'required' } as const,
                            { type: 'ShippedToAVS', requirement: 'required' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'SupplyDefenseMaterial':
                        return [
                            { type: 'DefenseMaterial', requirement: 'required' } as const,
                            { type: 'TIDorInvoice', requirement: 'optional' } as const,
                        ] satisfies IDisputeDefenseDocument[];
                }
            }

            break;
        }

        case 'visa': {
            if (dispute.reasonGroup === 'consumer') {
                switch (disputeDefenseReason) {
                    case 'InvalidChargeback':
                        return [{ type: 'InvalidChargeback', requirement: 'optional' } as const] satisfies IDisputeDefenseDocument[];

                    case 'MerchandiseReceived':
                        return [
                            { type: 'DateMerchandiseShipped', requirement: 'required' } as const,
                            { type: 'ProofOfGoodsOrServicesProvided', requirement: 'required' } as const,
                        ] satisfies IDisputeDefenseDocument[];

                    case 'ServicesProvided':
                        return [{ type: 'ProofOfGoodsOrServicesProvided', requirement: 'required' } as const] satisfies IDisputeDefenseDocument[];
                }
            } else if (dispute.reasonGroup === 'fraudulent') {
                switch (disputeDefenseReason) {
                    case 'AdditionalInformation':
                        return [{ type: 'DefenseMaterial', requirement: 'required' } as const] satisfies IDisputeDefenseDocument[];
                }
            }

            break;
        }
    }
};

type AdditionalDisputeDetails = Omit<IDisputeDetail, keyof IDispute>;

export const getAdditionalDisputeDetails = (dispute: (typeof DISPUTES)[number]) => {
    const allowedDefenseReasons = getAllowedDisputeDefenseReasons(dispute);
    const additionalDisputeDetails = {} as AdditionalDisputeDetails;

    additionalDisputeDetails.paymentPspReference = 'KLAHFUW1329523KKL';
    additionalDisputeDetails.allowedDefenseReasons = allowedDefenseReasons && [...allowedDefenseReasons];

    if (dispute.status === 'action_needed') {
        additionalDisputeDetails.defensibility = allowedDefenseReasons ? 'defendable' : 'defendable_externally';
    } else {
        const lastDefenseReason = allowedDefenseReasons?.[Number(dispute.id.slice(-2)) % allowedDefenseReasons?.length!];

        additionalDisputeDetails.defensibility = 'not_defendable';

        additionalDisputeDetails.latestDefense = {
            defendedOn: getDate(1, new Date(dispute.createdAt)),
            ...(lastDefenseReason && {
                reason: lastDefenseReason,
                suppliedDocuments: (getApplicableDisputeDefenseDocuments(dispute, lastDefenseReason) ?? [])
                    .filter(({ requirement }) => requirement === 'required')
                    .map(({ type }) => type),
            }),
        };
    }

    return { ...additionalDisputeDetails } as const;
};

export const getDisputesByStatusGroup = (status: 'open' | 'closed') => {
    return DISPUTES.filter(dispute =>
        status === 'open'
            ? dispute.status === 'action_needed' || dispute.status === 'under_review'
            : dispute.status === 'won' || dispute.status === 'lost'
    );
};

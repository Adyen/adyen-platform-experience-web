import { IDispute, IDisputeDetail, IDisputeStatusGroup, IDisputeDefenseDocument } from '../../src/types/api/models/disputes';

const todayDate = new Date();

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

const NEW_CHARGEBACKS = [
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000001',
        status: 'action_needed',
        dueDate: new Date(new Date().setHours(23)).toISOString(),
        createdAt: getDate(-10),
        paymentMethod: { type: 'mc', lastFourDigits: '0001', description: 'MasterCard' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 211100 },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'chargeback',
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000002',
        status: 'action_needed',
        dueDate: new Date(new Date().setHours(20)).toISOString(),
        createdAt: getDate(-9),
        paymentMethod: { type: 'visa', lastFourDigits: '0002', description: 'Visa Credit Card' },
        reason: { category: 'request_for_information', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 222200 },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'chargeback',
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000003',
        status: 'action_needed',
        dueDate: getDate(2),
        createdAt: getDate(-7),
        paymentMethod: { type: 'paypal', lastFourDigits: '0003', description: 'PayPal' },
        reason: { category: 'adjustment', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 233300 },
        allowedDefenseReasons: [],
        defensibility: 'defendable',
        type: 'chargeback',
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000004',
        status: 'action_needed',
        dueDate: getDate(20),
        createdAt: getDate(-7),
        paymentMethod: { type: 'klarna', lastFourDigits: '0004', description: 'Klarna Pay Later' },
        reason: { category: 'consumer_dispute', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 244400 },
        allowedDefenseReasons: [],
        defensibility: 'defendable',
        type: 'chargeback',
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000005',
        status: 'action_needed',
        dueDate: getDate(11),
        createdAt: getDate(-4),
        paymentMethod: { type: 'amex', lastFourDigits: '0005', description: 'American Express' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 255500 },
        allowedDefenseReasons: [],
        defensibility: 'defendable',
        type: 'chargeback',
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000006',
        status: 'action_needed',
        dueDate: getDate(13),
        createdAt: getDate(-4),
        paymentMethod: { type: 'mc', lastFourDigits: '0006', description: 'MasterCard' },
        reason: { category: 'consumer_dispute', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 266600 },
        allowedDefenseReasons: [],
        defensibility: 'defendable',
        type: 'chargeback',
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000007',
        status: 'action_needed',
        dueDate: getDate(15),
        createdAt: getDate(-3),
        paymentMethod: { type: 'visa', lastFourDigits: '0007', description: 'Visa Credit Card' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 277700 },
        allowedDefenseReasons: [],
        defensibility: 'defendable_externally',
        type: 'chargeback',
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000008',
        status: 'action_needed',
        dueDate: getDate(16),
        createdAt: getDate(-3),
        paymentMethod: { type: 'paypal', lastFourDigits: '0008', description: 'PayPal' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 288800 },
        allowedDefenseReasons: [],
        defensibility: 'defendable_externally',
        type: 'chargeback',
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000009',
        status: 'action_needed',
        dueDate: getDate(18),
        createdAt: getDate(-3),
        paymentMethod: { type: 'klarna', lastFourDigits: '0009', description: 'Klarna Pay Later' },
        reason: { category: 'other', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 299900 },
        allowedDefenseReasons: [],
        defensibility: 'defendable_externally',
        type: 'chargeback',
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000010',
        status: 'action_needed',
        dueDate: getDate(20),
        createdAt: getDate(-2),
        paymentMethod: { type: 'amex', lastFourDigits: '0010', description: 'American Express' },
        reason: { category: 'other', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 311000 },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'chargeback',
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000011',
        status: 'action_needed',
        dueDate: getDate(22),
        createdAt: getDate(-2),
        paymentMethod: { type: 'mc', lastFourDigits: '0011', description: 'MasterCard' },
        reason: { category: 'consumer_dispute', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 322100 },
        allowedDefenseReasons: [],
        defensibility: 'defendable',
        type: 'chargeback',
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000012',
        status: 'action_needed',
        dueDate: getDate(23),
        createdAt: getDate(-2),
        paymentMethod: { type: 'visa', lastFourDigits: '0012', description: 'Visa Credit Card' },
        reason: { category: 'consumer_dispute', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 333200 },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'chargeback',
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000013',
        status: 'action_needed',
        dueDate: getDate(26),
        createdAt: getDate(-2),
        paymentMethod: { type: 'paypal', lastFourDigits: '0013', description: 'PayPal' },
        reason: { category: 'other', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 344300 },
        allowedDefenseReasons: [],
        defensibility: 'defendable_externally',
        type: 'chargeback',
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000014',
        status: 'action_needed',
        dueDate: getDate(29),
        createdAt: getDate(-1),
        paymentMethod: { type: 'klarna', lastFourDigits: '0014', description: 'Klarna Pay Later' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        amount: { currency: 'USD', value: 355400 },
        allowedDefenseReasons: [],
        defensibility: 'defendable',
        type: 'chargeback',
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000015',
        status: 'action_needed',
        dueDate: getDate(30),
        createdAt: getDate(-2),
        paymentMethod: { type: 'amex', lastFourDigits: '0015', description: 'American Express' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        amount: { currency: 'EUR', value: 366500 },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'chargeback',
    },
] satisfies Readonly<IDispute[]>;

const ALL_DISPUTES = [
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000016',
        status: 'pending',
        createdAt: getDate(-3),
        paymentMethod: { type: 'mc', lastFourDigits: '0016', description: 'MasterCard' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'request_for_information',
        amount: { currency: 'USD', value: 377600 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000017',
        status: 'expired',
        createdAt: getDate(-3),
        paymentMethod: { type: 'visa', lastFourDigits: '0017', description: 'Visa Credit Card' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'defendable',
        type: 'request_for_information',
        amount: { currency: 'EUR', value: 388700 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000018',
        status: 'accepted',
        createdAt: getDate(-3),
        paymentMethod: { type: 'paypal', lastFourDigits: '0018', description: 'PayPal' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'defendable',
        type: 'chargeback',
        amount: { currency: 'USD', value: 399800 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000019',
        status: 'won',
        createdAt: getDate(-3),
        paymentMethod: { type: 'klarna', lastFourDigits: '0019', description: 'Klarna Pay Later' },
        reason: { category: 'other', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'defendable_externally',
        type: 'request_for_information',
        amount: { currency: 'EUR', value: 410900 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000020',
        status: 'lost',
        createdAt: getDate(-5),
        paymentMethod: { type: 'amex', lastFourDigits: '0020', description: 'American Express' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'defendable',
        type: 'request_for_information',
        amount: { currency: 'USD', value: 422000 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000021',
        status: 'pending',
        createdAt: getDate(-5),
        paymentMethod: { type: 'mc', lastFourDigits: '0021', description: 'MasterCard' },
        reason: { category: 'consumer_dispute', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'defendable',
        type: 'chargeback',
        amount: { currency: 'EUR', value: 433100 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000022',
        status: 'won',
        createdAt: getDate(-5),
        paymentMethod: { type: 'visa', lastFourDigits: '0022', description: 'Visa Credit Card' },
        reason: { category: 'other', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'request_for_information',
        amount: { currency: 'USD', value: 444200 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000024',
        status: 'lost',
        createdAt: getDate(-6),
        paymentMethod: { type: 'klarna', lastFourDigits: '0024', description: 'Klarna Pay Later' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'chargeback',
        amount: { currency: 'USD', value: 466400 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000025',
        status: 'expired',
        createdAt: getDate(-6),
        paymentMethod: { type: 'amex', lastFourDigits: '0025', description: 'American Express' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'chargeback',
        amount: { currency: 'EUR', value: 477500 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000026',
        status: 'pending',
        createdAt: getDate(-8),
        paymentMethod: { type: 'mc', lastFourDigits: '0026', description: 'MasterCard' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'defendable',
        type: 'request_for_information',
        amount: { currency: 'USD', value: 488600 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000027',
        status: 'lost',
        createdAt: getDate(-8),
        paymentMethod: { type: 'visa', lastFourDigits: '0027', description: 'Visa Credit Card' },
        reason: { category: 'consumer_dispute', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'chargeback',
        amount: { currency: 'EUR', value: 499700 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000031',
        status: 'won',
        createdAt: getDate(-12),
        paymentMethod: { type: 'visa', lastFourDigits: '0031', description: 'Visa Credit Card' },
        reason: { category: 'other', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'request_for_information',
        amount: { currency: 'EUR', value: 244100 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000033',
        status: 'accepted',
        createdAt: getDate(-12),
        paymentMethod: { type: 'mc', lastFourDigits: '0033', description: 'MasterCard' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'chargeback',
        amount: { currency: 'EUR', value: 266300 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000034',
        status: 'expired',
        createdAt: getDate(-12),
        paymentMethod: { type: 'visa', lastFourDigits: '0034', description: 'Visa Credit Card' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'request_for_information',
        amount: { currency: 'USD', value: 277400 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000038',
        status: 'lost',
        createdAt: getDate(-15),
        paymentMethod: { type: 'paypal', lastFourDigits: '0038', description: 'PayPal' },
        reason: { category: 'consumer_dispute', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'request_for_information',
        amount: { currency: 'USD', value: 321800 },
    },
] satisfies Readonly<IDispute[]>;

const FRAUD_ALERTS = [
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000041',
        status: 'action_needed',
        dueDate: new Date(todayDate.setHours(23)).toISOString(),
        createdAt: getDate(-10),
        paymentMethod: { type: 'mc', lastFourDigits: '0001', description: 'MasterCard' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'request_for_information',
        amount: { currency: 'EUR', value: 211100 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000042',
        status: 'action_needed',
        dueDate: new Date(todayDate.setHours(20)).toISOString(),
        createdAt: getDate(-9),
        paymentMethod: { type: 'visa', lastFourDigits: '0002', description: 'Visa Credit Card' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'request_for_information',
        amount: { currency: 'USD', value: 222200 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000043',
        status: 'action_needed',
        dueDate: getDate(2),
        createdAt: getDate(-7),
        paymentMethod: { type: 'paypal', lastFourDigits: '0003', description: 'PayPal' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'request_for_information',
        amount: { currency: 'EUR', value: 233300 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000044',
        status: 'action_needed',
        dueDate: getDate(20),
        createdAt: getDate(-7),
        paymentMethod: { type: 'klarna', lastFourDigits: '0004', description: 'Klarna Pay Later' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'request_for_information',
        amount: { currency: 'USD', value: 244400 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000045',
        status: 'action_needed',
        dueDate: getDate(11),
        createdAt: getDate(-4),
        paymentMethod: { type: 'amex', lastFourDigits: '0005', description: 'American Express' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'request_for_information',
        amount: { currency: 'EUR', value: 255500 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000046',
        status: 'action_needed',
        dueDate: getDate(13),
        createdAt: getDate(-4),
        paymentMethod: { type: 'mc', lastFourDigits: '0006', description: 'MasterCard' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'request_for_information',
        amount: { currency: 'USD', value: 266600 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000047',
        status: 'action_needed',
        dueDate: getDate(15),
        createdAt: getDate(-3),
        paymentMethod: { type: 'visa', lastFourDigits: '0007', description: 'Visa Credit Card' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'request_for_information',
        amount: { currency: 'EUR', value: 577700 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000048',
        status: 'action_needed',
        dueDate: getDate(16),
        createdAt: getDate(-3),
        paymentMethod: { type: 'paypal', lastFourDigits: '0008', description: 'PayPal' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'request_for_information',
        amount: { currency: 'USD', value: 200000 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000049',
        status: 'action_needed',
        dueDate: getDate(18),
        createdAt: getDate(-3),
        paymentMethod: { type: 'klarna', lastFourDigits: '0009', description: 'Klarna Pay Later' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'request_for_information',
        amount: { currency: 'EUR', value: 299900 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000050',
        status: 'action_needed',
        dueDate: getDate(20),
        createdAt: getDate(-2),
        paymentMethod: { type: 'amex', lastFourDigits: '0010', description: 'American Express' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'request_for_information',
        amount: { currency: 'USD', value: 311000 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000051',
        status: 'action_needed',
        dueDate: getDate(22),
        createdAt: getDate(-2),
        paymentMethod: { type: 'mc', lastFourDigits: '0011', description: 'MasterCard' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'request_for_information',
        amount: { currency: 'EUR', value: 412000 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000052',
        status: 'action_needed',
        dueDate: getDate(23),
        createdAt: getDate(-2),
        paymentMethod: { type: 'visa', lastFourDigits: '0012', description: 'Visa Credit Card' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'request_for_information',
        amount: { currency: 'USD', value: 911200 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000053',
        status: 'action_needed',
        dueDate: getDate(26),
        createdAt: getDate(-2),
        paymentMethod: { type: 'paypal', lastFourDigits: '0013', description: 'PayPal' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'request_for_information',
        amount: { currency: 'EUR', value: 344300 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000054',
        status: 'action_needed',
        dueDate: getDate(29),
        createdAt: getDate(-1),
        paymentMethod: { type: 'klarna', lastFourDigits: '0014', description: 'Klarna Pay Later' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'request_for_information',
        amount: { currency: 'USD', value: 755400 },
    },
    {
        pspReference: 'a1b2c3d4-e5f6-4789-abcd-000000000055',
        status: 'action_needed',
        dueDate: getDate(30),
        createdAt: getDate(-2),
        paymentMethod: { type: 'amex', lastFourDigits: '0015', description: 'American Express' },
        reason: { category: 'fraud', code: '4835', title: 'title' },
        allowedDefenseReasons: [],
        defensibility: 'not_defendable',
        type: 'request_for_information',
        amount: { currency: 'EUR', value: 510500 },
    },
] satisfies Readonly<IDispute[]>;

export const DISPUTES = [...NEW_CHARGEBACKS, ...ALL_DISPUTES, ...FRAUD_ALERTS] as const satisfies Readonly<IDispute[]>;

export const getDisputesByStatusGroup = (status: IDisputeStatusGroup) => {
    switch (status) {
        case 'NEW_CHARGEBACKS':
            return NEW_CHARGEBACKS;
        case 'FRAUD_ALERTS':
            return FRAUD_ALERTS;
        case 'ALL_DISPUTES':
        default:
            return ALL_DISPUTES;
    }
};
export const getAllowedDisputeDefenseReasons = (dispute: (typeof DISPUTES)[number]) => {
    switch (dispute.paymentMethod.type) {
        case 'mc': {
            if (dispute.reason.category === 'consumer_dispute') return MC_CONSUMER_DEFENSE_REASONS;
            if (dispute.reason.category === 'fraud') return MC_FRAUD_DEFENSE_REASONS;
            break;
        }
        case 'visa': {
            if (dispute.reason.category === 'consumer_dispute') return VISA_CONSUMER_DEFENSE_REASONS;
            if (dispute.reason.category === 'fraud') return VISA_FRAUD_DEFENSE_REASONS;
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
            if (dispute.reason.category === 'consumer_dispute') {
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
            } else if (dispute.reason.category === 'fraud') {
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
            if (dispute.reason.category === 'consumer_dispute') {
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
            } else if (dispute.reason.category === 'fraud') {
                switch (disputeDefenseReason) {
                    case 'AdditionalInformation':
                        return [{ documentTypeCode: 'DefenseMaterial', requirementLevel: 'REQUIRED' } as const] satisfies IDisputeDefenseDocument[];
                }
            }

            break;
        }
    }
};

type AdditionalDisputeDetails = Omit<IDisputeDetail, 'dispute'> & { dispute: Partial<IDisputeDetail['dispute']> };

export const getAdditionalDisputeDetails = (dispute: (typeof DISPUTES)[number]) => {
    const allowedDefenseReasons = getAllowedDisputeDefenseReasons(dispute);
    const additionalDisputeDetails = {} as AdditionalDisputeDetails;

    additionalDisputeDetails.payment = { pspReference: 'KLAHFUW1329523KKL', balanceAccountDescription: 'Main account', isRefunded: false };
    additionalDisputeDetails.dispute = { allowedDefenseReasons: allowedDefenseReasons ? [...allowedDefenseReasons] : [] };

    if (dispute.status === 'action_needed') {
        additionalDisputeDetails.dispute.defensibility = allowedDefenseReasons ? 'defendable' : 'defendable_externally';
    } else {
        additionalDisputeDetails.dispute.defensibility = 'not_defendable';
        additionalDisputeDetails.defense = {
            reason: 'ServicesProvided',
            suppliedDocuments: ['GoodsOrServicesProvided', 'WrittenRebuttal'],
            defendedOn: getDate(1, new Date(dispute.createdAt)),
            defendedThroughComponent: true,
        };
    }

    return { ...additionalDisputeDetails } as const;
};

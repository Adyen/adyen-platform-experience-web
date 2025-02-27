export const DISPUTES = [
    // 15 Action Needed
    {
        _links: { prev: { cursor: 'cursor-prev-1' }, next: { cursor: 'cursor-next-1' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000001',
                status: 'action_needed',
                dueDate: '2025-03-01T12:00:00.000Z',
                createdAt: '2025-02-01T09:00:00.000Z',
                paymentMethod: { type: 'mc', lastFourDigits: '0001', description: 'MasterCard' },
                bankAccount: { accountNumberLastFourDigits: 'B0001' },
                reasonCode: 'RC1',
                amount: { currency: 'EUR', value: '211100' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-2' }, next: { cursor: 'cursor-next-2' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000002',
                status: 'action_needed',
                dueDate: '2025-03-02T12:00:00.000Z',
                createdAt: '2025-02-02T09:00:00.000Z',
                paymentMethod: { type: 'visa', lastFourDigits: '0002', description: 'Visa Credit Card' },
                bankAccount: { accountNumberLastFourDigits: 'B0002' },
                reasonCode: 'RC2',
                amount: { currency: 'USD', value: '222200' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-3' }, next: { cursor: 'cursor-next-3' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000003',
                status: 'action_needed',
                dueDate: '2025-03-03T12:00:00.000Z',
                createdAt: '2025-02-03T09:00:00.000Z',
                paymentMethod: { type: 'paypal', lastFourDigits: '0003', description: 'PayPal' },
                bankAccount: { accountNumberLastFourDigits: 'B0003' },
                reasonCode: 'RC3',
                amount: { currency: 'EUR', value: '233300' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-4' }, next: { cursor: 'cursor-next-4' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000004',
                status: 'action_needed',
                dueDate: '2025-03-04T12:00:00.000Z',
                createdAt: '2025-02-04T09:00:00.000Z',
                paymentMethod: { type: 'klarna', lastFourDigits: '0004', description: 'Klarna Pay Later' },
                bankAccount: { accountNumberLastFourDigits: 'B0004' },
                reasonCode: 'RC4',
                amount: { currency: 'USD', value: '244400' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-5' }, next: { cursor: 'cursor-next-5' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000005',
                status: 'action_needed',
                dueDate: '2025-03-05T12:00:00.000Z',
                createdAt: '2025-02-05T09:00:00.000Z',
                paymentMethod: { type: 'amex', lastFourDigits: '0005', description: 'American Express' },
                bankAccount: { accountNumberLastFourDigits: 'B0005' },
                reasonCode: 'RC5',
                amount: { currency: 'EUR', value: '255500' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-6' }, next: { cursor: 'cursor-next-6' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000006',
                status: 'action_needed',
                dueDate: '2025-03-06T12:00:00.000Z',
                createdAt: '2025-02-06T09:00:00.000Z',
                paymentMethod: { type: 'mc', lastFourDigits: '0006', description: 'MasterCard' },
                bankAccount: { accountNumberLastFourDigits: 'B0006' },
                reasonCode: 'RC6',
                amount: { currency: 'USD', value: '266600' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-7' }, next: { cursor: 'cursor-next-7' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000007',
                status: 'action_needed',
                dueDate: '2025-03-07T12:00:00.000Z',
                createdAt: '2025-02-07T09:00:00.000Z',
                paymentMethod: { type: 'visa', lastFourDigits: '0007', description: 'Visa Credit Card' },
                bankAccount: { accountNumberLastFourDigits: 'B0007' },
                reasonCode: 'RC7',
                amount: { currency: 'EUR', value: '277700' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-8' }, next: { cursor: 'cursor-next-8' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000008',
                status: 'action_needed',
                dueDate: '2025-03-08T12:00:00.000Z',
                createdAt: '2025-02-08T09:00:00.000Z',
                paymentMethod: { type: 'paypal', lastFourDigits: '0008', description: 'PayPal' },
                bankAccount: { accountNumberLastFourDigits: 'B0008' },
                reasonCode: 'RC8',
                amount: { currency: 'USD', value: '288800' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-9' }, next: { cursor: 'cursor-next-9' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000009',
                status: 'action_needed',
                dueDate: '2025-03-09T12:00:00.000Z',
                createdAt: '2025-02-09T09:00:00.000Z',
                paymentMethod: { type: 'klarna', lastFourDigits: '0009', description: 'Klarna Pay Later' },
                bankAccount: { accountNumberLastFourDigits: 'B0009' },
                reasonCode: 'RC9',
                amount: { currency: 'EUR', value: '299900' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-10' }, next: { cursor: 'cursor-next-10' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000010',
                status: 'action_needed',
                dueDate: '2025-03-10T12:00:00.000Z',
                createdAt: '2025-02-10T09:00:00.000Z',
                paymentMethod: { type: 'amex', lastFourDigits: '0010', description: 'American Express' },
                bankAccount: { accountNumberLastFourDigits: 'B0010' },
                reasonCode: 'RC10',
                amount: { currency: 'USD', value: '311000' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-11' }, next: { cursor: 'cursor-next-11' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000011',
                status: 'action_needed',
                dueDate: '2025-03-11T12:00:00.000Z',
                createdAt: '2025-02-11T09:00:00.000Z',
                paymentMethod: { type: 'mc', lastFourDigits: '0011', description: 'MasterCard' },
                bankAccount: { accountNumberLastFourDigits: 'B0011' },
                reasonCode: 'RC11',
                amount: { currency: 'EUR', value: '322100' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-12' }, next: { cursor: 'cursor-next-12' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000012',
                status: 'action_needed',
                dueDate: '2025-03-12T12:00:00.000Z',
                createdAt: '2025-02-12T09:00:00.000Z',
                paymentMethod: { type: 'visa', lastFourDigits: '0012', description: 'Visa Credit Card' },
                bankAccount: { accountNumberLastFourDigits: 'B0012' },
                reasonCode: 'RC12',
                amount: { currency: 'USD', value: '333200' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-13' }, next: { cursor: 'cursor-next-13' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000013',
                status: 'action_needed',
                dueDate: '2025-03-13T12:00:00.000Z',
                createdAt: '2025-02-13T09:00:00.000Z',
                paymentMethod: { type: 'paypal', lastFourDigits: '0013', description: 'PayPal' },
                bankAccount: { accountNumberLastFourDigits: 'B0013' },
                reasonCode: 'RC13',
                amount: { currency: 'EUR', value: '344300' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-14' }, next: { cursor: 'cursor-next-14' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000014',
                status: 'action_needed',
                dueDate: '2025-03-14T12:00:00.000Z',
                createdAt: '2025-02-14T09:00:00.000Z',
                paymentMethod: { type: 'klarna', lastFourDigits: '0014', description: 'Klarna Pay Later' },
                bankAccount: { accountNumberLastFourDigits: 'B0014' },
                reasonCode: 'RC14',
                amount: { currency: 'USD', value: '355400' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-15' }, next: { cursor: 'cursor-next-15' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000015',
                status: 'action_needed',
                dueDate: '2025-03-15T12:00:00.000Z',
                createdAt: '2025-02-15T09:00:00.000Z',
                paymentMethod: { type: 'amex', lastFourDigits: '0015', description: 'American Express' },
                bankAccount: { accountNumberLastFourDigits: 'B0015' },
                reasonCode: 'RC15',
                amount: { currency: 'EUR', value: '366500' },
            },
        ],
    },

    // 15 Under Review
    {
        _links: { prev: { cursor: 'cursor-prev-16' }, next: { cursor: 'cursor-next-16' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000016',
                status: 'under_review',
                createdAt: '2025-02-01T10:00:00.000Z',
                paymentMethod: { type: 'mc', lastFourDigits: '0016', description: 'MasterCard' },
                bankAccount: { accountNumberLastFourDigits: 'B0016' },
                reasonCode: 'RC16',
                amount: { currency: 'USD', value: '377600' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-17' }, next: { cursor: 'cursor-next-17' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000017',
                status: 'under_review',
                createdAt: '2025-02-02T10:00:00.000Z',
                paymentMethod: { type: 'visa', lastFourDigits: '0017', description: 'Visa Credit Card' },
                bankAccount: { accountNumberLastFourDigits: 'B0017' },
                reasonCode: 'RC17',
                amount: { currency: 'EUR', value: '388700' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-18' }, next: { cursor: 'cursor-next-18' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000018',
                status: 'under_review',
                createdAt: '2025-02-03T10:00:00.000Z',
                paymentMethod: { type: 'paypal', lastFourDigits: '0018', description: 'PayPal' },
                bankAccount: { accountNumberLastFourDigits: 'B0018' },
                reasonCode: 'RC18',
                amount: { currency: 'USD', value: '399800' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-19' }, next: { cursor: 'cursor-next-19' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000019',
                status: 'under_review',
                createdAt: '2025-02-04T10:00:00.000Z',
                paymentMethod: { type: 'klarna', lastFourDigits: '0019', description: 'Klarna Pay Later' },
                bankAccount: { accountNumberLastFourDigits: 'B0019' },
                reasonCode: 'RC19',
                amount: { currency: 'EUR', value: '410900' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-20' }, next: { cursor: 'cursor-next-20' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000020',
                status: 'under_review',
                createdAt: '2025-02-05T10:00:00.000Z',
                paymentMethod: { type: 'amex', lastFourDigits: '0020', description: 'American Express' },
                bankAccount: { accountNumberLastFourDigits: 'B0020' },
                reasonCode: 'RC20',
                amount: { currency: 'USD', value: '422000' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-21' }, next: { cursor: 'cursor-next-21' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000021',
                status: 'under_review',
                createdAt: '2025-02-06T10:00:00.000Z',
                paymentMethod: { type: 'mc', lastFourDigits: '0021', description: 'MasterCard' },
                bankAccount: { accountNumberLastFourDigits: 'B0021' },
                reasonCode: 'RC21',
                amount: { currency: 'EUR', value: '433100' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-22' }, next: { cursor: 'cursor-next-22' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000022',
                status: 'under_review',
                createdAt: '2025-02-07T10:00:00.000Z',
                paymentMethod: { type: 'visa', lastFourDigits: '0022', description: 'Visa Credit Card' },
                bankAccount: { accountNumberLastFourDigits: 'B0022' },
                reasonCode: 'RC22',
                amount: { currency: 'USD', value: '444200' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-23' }, next: { cursor: 'cursor-next-23' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000023',
                status: 'under_review',
                createdAt: '2025-02-08T10:00:00.000Z',
                paymentMethod: { type: 'paypal', lastFourDigits: '0023', description: 'PayPal' },
                bankAccount: { accountNumberLastFourDigits: 'B0023' },
                reasonCode: 'RC23',
                amount: { currency: 'EUR', value: '455300' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-24' }, next: { cursor: 'cursor-next-24' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000024',
                status: 'under_review',
                createdAt: '2025-02-09T10:00:00.000Z',
                paymentMethod: { type: 'klarna', lastFourDigits: '0024', description: 'Klarna Pay Later' },
                bankAccount: { accountNumberLastFourDigits: 'B0024' },
                reasonCode: 'RC24',
                amount: { currency: 'USD', value: '466400' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-25' }, next: { cursor: 'cursor-next-25' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000025',
                status: 'under_review',
                createdAt: '2025-02-10T10:00:00.000Z',
                paymentMethod: { type: 'amex', lastFourDigits: '0025', description: 'American Express' },
                bankAccount: { accountNumberLastFourDigits: 'B0025' },
                reasonCode: 'RC25',
                amount: { currency: 'EUR', value: '477500' },
            },
        ],
    },

    // 15 Closed
    {
        _links: { prev: { cursor: 'cursor-prev-26' }, next: { cursor: 'cursor-next-26' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000026',
                status: 'closed',
                createdAt: '2025-02-01T11:00:00.000Z',
                paymentMethod: { type: 'mc', lastFourDigits: '0026', description: 'MasterCard' },
                bankAccount: { accountNumberLastFourDigits: 'B0026' },
                reasonCode: 'RC26',
                amount: { currency: 'USD', value: '488600' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-27' }, next: { cursor: 'cursor-next-27' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000027',
                status: 'closed',
                createdAt: '2025-02-02T11:00:00.000Z',
                paymentMethod: { type: 'visa', lastFourDigits: '0027', description: 'Visa Credit Card' },
                bankAccount: { accountNumberLastFourDigits: 'B0027' },
                reasonCode: 'RC27',
                amount: { currency: 'EUR', value: '499700' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-28' }, next: { cursor: 'cursor-next-28' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000028',
                status: 'closed',
                createdAt: '2025-02-03T11:00:00.000Z',
                paymentMethod: { type: 'paypal', lastFourDigits: '0028', description: 'PayPal' },
                bankAccount: { accountNumberLastFourDigits: 'B0028' },
                reasonCode: 'RC28',
                amount: { currency: 'USD', value: '210800' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-29' }, next: { cursor: 'cursor-next-29' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000029',
                status: 'closed',
                createdAt: '2025-02-04T11:00:00.000Z',
                paymentMethod: { type: 'amex', lastFourDigits: '0029', description: 'American Express' },
                bankAccount: { accountNumberLastFourDigits: 'B0029' },
                reasonCode: 'RC29',
                amount: { currency: 'EUR', value: '221900' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-30' }, next: { cursor: 'cursor-next-30' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000030',
                status: 'closed',
                createdAt: '2025-02-05T11:00:00.000Z',
                paymentMethod: { type: 'mc', lastFourDigits: '0030', description: 'MasterCard' },
                bankAccount: { accountNumberLastFourDigits: 'B0030' },
                reasonCode: 'RC30',
                amount: { currency: 'USD', value: '233000' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-31' }, next: { cursor: 'cursor-next-31' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000031',
                status: 'closed',
                createdAt: '2025-02-06T11:00:00.000Z',
                paymentMethod: { type: 'visa', lastFourDigits: '0031', description: 'Visa Credit Card' },
                bankAccount: { accountNumberLastFourDigits: 'B0031' },
                reasonCode: 'RC31',
                amount: { currency: 'EUR', value: '244100' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-32' }, next: { cursor: 'cursor-next-32' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000032',
                status: 'closed',
                createdAt: '2025-02-07T11:00:00.000Z',
                paymentMethod: { type: 'paypal', lastFourDigits: '0032', description: 'PayPal' },
                bankAccount: { accountNumberLastFourDigits: 'B0032' },
                reasonCode: 'RC32',
                amount: { currency: 'USD', value: '255200' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-33' }, next: { cursor: 'cursor-next-33' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000033',
                status: 'closed',
                createdAt: '2025-02-08T11:00:00.000Z',
                paymentMethod: { type: 'mc', lastFourDigits: '0033', description: 'MasterCard' },
                bankAccount: { accountNumberLastFourDigits: 'B0033' },
                reasonCode: 'RC33',
                amount: { currency: 'EUR', value: '266300' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-34' }, next: { cursor: 'cursor-next-34' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000034',
                status: 'closed',
                createdAt: '2025-02-09T11:00:00.000Z',
                paymentMethod: { type: 'visa', lastFourDigits: '0034', description: 'Visa Credit Card' },
                bankAccount: { accountNumberLastFourDigits: 'B0034' },
                reasonCode: 'RC34',
                amount: { currency: 'USD', value: '277400' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-35' }, next: { cursor: 'cursor-next-35' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000035',
                status: 'closed',
                createdAt: '2025-02-10T11:00:00.000Z',
                paymentMethod: { type: 'paypal', lastFourDigits: '0035', description: 'PayPal' },
                bankAccount: { accountNumberLastFourDigits: 'B0035' },
                reasonCode: 'RC35',
                amount: { currency: 'EUR', value: '288500' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-36' }, next: { cursor: 'cursor-next-36' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000036',
                status: 'closed',
                createdAt: '2025-02-11T11:00:00.000Z',
                paymentMethod: { type: 'mc', lastFourDigits: '0036', description: 'MasterCard' },
                bankAccount: { accountNumberLastFourDigits: 'B0036' },
                reasonCode: 'RC36',
                amount: { currency: 'USD', value: '299600' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-37' }, next: { cursor: 'cursor-next-37' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000037',
                status: 'closed',
                createdAt: '2025-02-12T11:00:00.000Z',
                paymentMethod: { type: 'visa', lastFourDigits: '0037', description: 'Visa Credit Card' },
                bankAccount: { accountNumberLastFourDigits: 'B0037' },
                reasonCode: 'RC37',
                amount: { currency: 'EUR', value: '310700' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-38' }, next: { cursor: 'cursor-next-38' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000038',
                status: 'closed',
                createdAt: '2025-02-13T11:00:00.000Z',
                paymentMethod: { type: 'paypal', lastFourDigits: '0038', description: 'PayPal' },
                bankAccount: { accountNumberLastFourDigits: 'B0038' },
                reasonCode: 'RC38',
                amount: { currency: 'USD', value: '321800' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-39' }, next: { cursor: 'cursor-next-39' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000039',
                status: 'closed',
                createdAt: '2025-02-14T11:00:00.000Z',
                paymentMethod: { type: 'mc', lastFourDigits: '0039', description: 'MasterCard' },
                bankAccount: { accountNumberLastFourDigits: 'B0039' },
                reasonCode: 'RC39',
                amount: { currency: 'EUR', value: '332900' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-40' }, next: { cursor: 'cursor-next-40' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000040',
                status: 'closed',
                createdAt: '2025-02-15T11:00:00.000Z',
                paymentMethod: { type: 'visa', lastFourDigits: '0040', description: 'Visa Credit Card' },
                bankAccount: { accountNumberLastFourDigits: 'B0040' },
                reasonCode: 'RC40',
                amount: { currency: 'USD', value: '344000' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-41' }, next: { cursor: 'cursor-next-41' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000041',
                status: 'closed',
                createdAt: '2025-02-01T11:00:00.000Z',
                paymentMethod: { type: 'mc', lastFourDigits: '0041', description: 'MasterCard' },
                bankAccount: { accountNumberLastFourDigits: 'B0041' },
                reasonCode: 'RC41',
                amount: { currency: 'EUR', value: '355100' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-42' }, next: { cursor: 'cursor-next-42' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000042',
                status: 'closed',
                createdAt: '2025-02-02T11:00:00.000Z',
                paymentMethod: { type: 'visa', lastFourDigits: '0042', description: 'Visa Credit Card' },
                bankAccount: { accountNumberLastFourDigits: 'B0042' },
                reasonCode: 'RC42',
                amount: { currency: 'USD', value: '366200' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-43' }, next: { cursor: 'cursor-next-43' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000043',
                status: 'closed',
                createdAt: '2025-02-03T11:00:00.000Z',
                paymentMethod: { type: 'mc', lastFourDigits: '0043', description: 'MasterCard' },
                bankAccount: { accountNumberLastFourDigits: 'B0043' },
                reasonCode: 'RC43',
                amount: { currency: 'EUR', value: '377300' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-44' }, next: { cursor: 'cursor-next-44' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000044',
                status: 'closed',
                createdAt: '2025-02-04T11:00:00.000Z',
                paymentMethod: { type: 'visa', lastFourDigits: '0044', description: 'Visa Credit Card' },
                bankAccount: { accountNumberLastFourDigits: 'B0044' },
                reasonCode: 'RC44',
                amount: { currency: 'USD', value: '388400' },
            },
        ],
    },
    {
        _links: { prev: { cursor: 'cursor-prev-45' }, next: { cursor: 'cursor-next-45' } },
        data: [
            {
                id: 'a1b2c3d4-e5f6-4789-abcd-000000000045',
                status: 'closed',
                createdAt: '2025-02-05T11:00:00.000Z',
                paymentMethod: { type: 'mc', lastFourDigits: '0045', description: 'MasterCard' },
                bankAccount: { accountNumberLastFourDigits: 'B0045' },
                reasonCode: 'RC45',
                amount: { currency: 'EUR', value: '399500' },
            },
        ],
    },
];

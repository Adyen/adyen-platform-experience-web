import { IPayByLinkStatusGroup, IPaymentLinkItem } from '../../src';

export interface IPaymentLinksListResponse {
    _links?: {
        prev?: {
            cursor: string;
        };
        next?: {
            cursor: string;
        };
    };
    data: IPaymentLinkItem[];
}

export const ACTIVE_PAYMENT_LINKS: IPaymentLinkItem[] = [
    {
        amount: {
            currency: 'USD',
            value: 15000,
        },
        creationDate: '2025-10-01T10:00:00+02:00',
        expirationDate: '2025-11-08T10:00:00+02:00',
        paymentLinkId: 'PLTEST001',
        merchantReference: 'REF-001',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'active',
    },
    {
        amount: {
            currency: 'EUR',
            value: 25000,
        },
        creationDate: '2025-10-02T10:00:00+02:00',
        expirationDate: '2025-11-09T10:00:00+02:00',
        paymentLinkId: 'PLTEST002',
        merchantReference: 'REF-002',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'active',
    },
    {
        amount: {
            currency: 'GBP',
            value: 50000,
        },
        creationDate: '2025-10-03T10:00:00+02:00',
        expirationDate: '2025-11-06T10:00:00+02:00',
        paymentLinkId: 'PLTEST003',
        merchantReference: 'REF-003',
        linkType: 'singleUse',
        status: 'paymentPending',
    },
    {
        amount: {
            currency: 'USD',
            value: 10000,
        },
        creationDate: '2025-10-04T10:00:00+02:00',
        expirationDate: '2025-11-11T10:00:00+02:00',
        paymentLinkId: 'PLTEST004',
        merchantReference: 'REF-004',
        linkType: 'open',
        status: 'paymentPending',
    },
    {
        amount: {
            currency: 'CAD',
            value: 35000,
        },
        creationDate: '2025-10-05T10:00:00+02:00',
        expirationDate: '2025-10-12T10:00:00+02:00',
        paymentLinkId: 'PLTEST005',
        merchantReference: 'REF-005',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'active',
    },
    {
        amount: {
            currency: 'AUD',
            value: 89900,
        },
        creationDate: '2025-10-06T10:00:00+02:00',
        expirationDate: '2025-10-13T10:00:00+02:00',
        paymentLinkId: 'PLTEST006',
        merchantReference: 'REF-006',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'active',
    },
    {
        amount: {
            currency: 'JPY',
            value: 1250000,
        },
        creationDate: '2025-10-07T10:00:00+02:00',
        expirationDate: '2025-10-14T10:00:00+02:00',
        paymentLinkId: 'PLTEST007',
        merchantReference: 'REF-007',
        linkType: 'singleUse',
        status: 'paymentPending',
    },
    {
        amount: {
            currency: 'CHF',
            value: 12500,
        },
        creationDate: '2025-10-08T10:00:00+02:00',
        expirationDate: '2025-10-15T10:00:00+02:00',
        paymentLinkId: 'PLTEST008',
        merchantReference: 'REF-008',
        linkType: 'open',
        shopperEmail: 'shopper@example.com',
        status: 'active',
    },
    {
        amount: {
            currency: 'SEK',
            value: 45000,
        },
        creationDate: '2025-10-09T10:00:00+02:00',
        expirationDate: '2025-10-16T10:00:00+02:00',
        paymentLinkId: 'PLTEST009',
        merchantReference: 'REF-009',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'paymentPending',
    },
    {
        amount: {
            currency: 'EUR',
            value: 7500,
        },
        creationDate: '2025-10-10T10:00:00+02:00',
        expirationDate: '2025-10-17T10:00:00+02:00',
        paymentLinkId: 'PLTEST010',
        merchantReference: 'REF-010',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'active',
    },
    {
        amount: {
            currency: 'USD',
            value: 199900,
        },
        creationDate: '2025-10-11T10:00:00+02:00',
        expirationDate: '2025-10-18T10:00:00+02:00',
        paymentLinkId: 'PLTEST011',
        merchantReference: 'REF-011',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'paymentPending',
    },
    {
        amount: {
            currency: 'GBP',
            value: 32000,
        },
        creationDate: '2025-10-12T10:00:00+02:00',
        expirationDate: '2025-10-19T10:00:00+02:00',
        paymentLinkId: 'PLTEST012',
        merchantReference: 'REF-012',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'active',
    },
    {
        amount: {
            currency: 'DKK',
            value: 55000,
        },
        creationDate: '2025-10-13T10:00:00+02:00',
        expirationDate: '2025-10-20T10:00:00+02:00',
        paymentLinkId: 'PLTEST013',
        merchantReference: 'REF-013',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'active',
    },
    {
        amount: {
            currency: 'NOK',
            value: 68000,
        },
        creationDate: '2025-10-14T10:00:00+02:00',
        expirationDate: '2025-10-21T10:00:00+02:00',
        paymentLinkId: 'PLTEST014',
        merchantReference: 'REF-014',
        linkType: 'open',
        shopperEmail: 'shopper@example.com',
        status: 'active',
    },
    {
        amount: {
            currency: 'PLN',
            value: 125000,
        },
        creationDate: '2025-10-15T10:00:00+02:00',
        expirationDate: '2025-10-22T10:00:00+02:00',
        paymentLinkId: 'PLTEST015',
        merchantReference: 'REF-015',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'active',
    },
    {
        amount: {
            currency: 'SGD',
            value: 42000,
        },
        creationDate: '2025-10-16T10:00:00+02:00',
        expirationDate: '2025-10-23T10:00:00+02:00',
        paymentLinkId: 'PLTEST016',
        merchantReference: 'REF-016',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'paymentPending',
    },
    {
        amount: {
            currency: 'NZD',
            value: 28500,
        },
        creationDate: '2025-10-17T10:00:00+02:00',
        expirationDate: '2025-10-24T10:00:00+02:00',
        paymentLinkId: 'PLTEST017',
        merchantReference: 'REF-017',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'active',
    },
    {
        amount: {
            currency: 'BRL',
            value: 185000,
        },
        creationDate: '2025-10-18T10:00:00+02:00',
        expirationDate: '2025-10-25T10:00:00+02:00',
        paymentLinkId: 'PLTEST018',
        merchantReference: 'REF-018',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'active',
    },
    {
        amount: {
            currency: 'MXN',
            value: 95000,
        },
        creationDate: '2025-10-19T10:00:00+02:00',
        expirationDate: '2025-10-26T10:00:00+02:00',
        paymentLinkId: 'PLTEST019',
        merchantReference: 'REF-019',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'paymentPending',
    },
    {
        amount: {
            currency: 'ZAR',
            value: 175000,
        },
        creationDate: '2025-10-20T10:00:00+02:00',
        expirationDate: '2025-10-27T10:00:00+02:00',
        paymentLinkId: 'PLTEST020',
        merchantReference: 'REF-020',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'active',
    },
    {
        amount: {
            currency: 'HKD',
            value: 38000,
        },
        creationDate: '2025-10-21T10:00:00+02:00',
        expirationDate: '2025-10-28T10:00:00+02:00',
        paymentLinkId: 'PLTEST021',
        merchantReference: 'REF-021',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'active',
    },
    {
        amount: {
            currency: 'INR',
            value: 450000,
        },
        creationDate: '2025-10-22T10:00:00+02:00',
        expirationDate: '2025-10-29T10:00:00+02:00',
        paymentLinkId: 'PLTEST022',
        merchantReference: 'REF-022',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'active',
    },
    {
        amount: {
            currency: 'AED',
            value: 72000,
        },
        creationDate: '2025-10-23T10:00:00+02:00',
        expirationDate: '2025-10-30T10:00:00+02:00',
        paymentLinkId: 'PLTEST023',
        merchantReference: 'REF-023',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'active',
    },
    {
        amount: {
            currency: 'THB',
            value: 320000,
        },
        creationDate: '2025-10-24T10:00:00+02:00',
        expirationDate: '2025-10-31T10:00:00+02:00',
        paymentLinkId: 'PLTEST024',
        merchantReference: 'REF-024',
        linkType: 'open',
        shopperEmail: 'shopper@example.com',
        status: 'active',
    },
    {
        amount: {
            currency: 'KRW',
            value: 5500000,
        },
        creationDate: '2025-10-25T10:00:00+02:00',
        expirationDate: '2025-11-01T10:00:00+02:00',
        paymentLinkId: 'PLTEST025',
        merchantReference: 'REF-025',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'active',
    },
];

export const INACTIVE_PAYMENT_LINKS: IPaymentLinkItem[] = [
    {
        amount: {
            currency: 'USD',
            value: 15000,
        },
        creationDate: '2025-10-01T10:00:00+02:00',
        expirationDate: '2025-11-08T10:00:00+02:00',
        paymentLinkId: 'PLTEST026',
        merchantReference: 'REF-001',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'completed',
    },
    {
        amount: {
            currency: 'EUR',
            value: 25000,
        },
        creationDate: '2025-10-02T10:00:00+02:00',
        expirationDate: '2025-11-09T10:00:00+02:00',
        paymentLinkId: 'PLTEST027',
        merchantReference: 'REF-002',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'expired',
    },
    {
        amount: {
            currency: 'GBP',
            value: 50000,
        },
        creationDate: '2025-10-03T10:00:00+02:00',
        expirationDate: '2025-11-06T10:00:00+02:00',
        paymentLinkId: 'PLTEST028',
        merchantReference: 'REF-003',
        linkType: 'singleUse',
        status: 'expired',
    },
    {
        amount: {
            currency: 'USD',
            value: 10000,
        },
        creationDate: '2025-10-04T10:00:00+02:00',
        expirationDate: '2025-11-11T10:00:00+02:00',
        paymentLinkId: 'PLTEST029',
        merchantReference: 'REF-004',
        linkType: 'open',
        status: 'completed',
    },
    {
        amount: {
            currency: 'CAD',
            value: 35000,
        },
        creationDate: '2025-10-05T10:00:00+02:00',
        expirationDate: '2025-10-12T10:00:00+02:00',
        paymentLinkId: 'PLTEST030',
        merchantReference: 'REF-005',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'expired',
    },
    {
        amount: {
            currency: 'AUD',
            value: 89900,
        },
        creationDate: '2025-10-06T10:00:00+02:00',
        expirationDate: '2025-10-13T10:00:00+02:00',
        paymentLinkId: 'PLTEST031',
        merchantReference: 'REF-006',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'completed',
    },
    {
        amount: {
            currency: 'JPY',
            value: 1250000,
        },
        creationDate: '2025-10-07T10:00:00+02:00',
        expirationDate: '2025-10-14T10:00:00+02:00',
        paymentLinkId: 'PLTEST032',
        merchantReference: 'REF-007',
        linkType: 'singleUse',
        status: 'expired',
    },
    {
        amount: {
            currency: 'CHF',
            value: 12500,
        },
        creationDate: '2025-10-08T10:00:00+02:00',
        expirationDate: '2025-10-15T10:00:00+02:00',
        paymentLinkId: 'PLTEST033',
        merchantReference: 'REF-008',
        linkType: 'open',
        shopperEmail: 'shopper@example.com',
        status: 'expired',
    },
    {
        amount: {
            currency: 'SEK',
            value: 45000,
        },
        creationDate: '2025-10-09T10:00:00+02:00',
        expirationDate: '2025-10-16T10:00:00+02:00',
        paymentLinkId: 'PLTEST034',
        merchantReference: 'REF-009',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'expired',
    },
    {
        amount: {
            currency: 'EUR',
            value: 7500,
        },
        creationDate: '2025-10-10T10:00:00+02:00',
        expirationDate: '2025-10-17T10:00:00+02:00',
        paymentLinkId: 'PLTEST035',
        merchantReference: 'REF-010',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'expired',
    },
    {
        amount: {
            currency: 'USD',
            value: 199900,
        },
        creationDate: '2025-10-11T10:00:00+02:00',
        expirationDate: '2025-10-18T10:00:00+02:00',
        paymentLinkId: 'PLTEST036',
        merchantReference: 'REF-011',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'completed',
    },
    {
        amount: {
            currency: 'GBP',
            value: 32000,
        },
        creationDate: '2025-10-12T10:00:00+02:00',
        expirationDate: '2025-10-19T10:00:00+02:00',
        paymentLinkId: 'PLTEST037',
        merchantReference: 'REF-012',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'completed',
    },
    {
        amount: {
            currency: 'DKK',
            value: 55000,
        },
        creationDate: '2025-10-13T10:00:00+02:00',
        expirationDate: '2025-10-20T10:00:00+02:00',
        paymentLinkId: 'PLTEST038',
        merchantReference: 'REF-013',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'expired',
    },
    {
        amount: {
            currency: 'NOK',
            value: 68000,
        },
        creationDate: '2025-10-14T10:00:00+02:00',
        expirationDate: '2025-10-21T10:00:00+02:00',
        paymentLinkId: 'PLTEST039',
        merchantReference: 'REF-014',
        linkType: 'open',
        shopperEmail: 'shopper@example.com',
        status: 'completed',
    },
    {
        amount: {
            currency: 'PLN',
            value: 125000,
        },
        creationDate: '2025-10-15T10:00:00+02:00',
        expirationDate: '2025-10-22T10:00:00+02:00',
        paymentLinkId: 'PLTEST040',
        merchantReference: 'REF-015',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'expired',
    },
    {
        amount: {
            currency: 'SGD',
            value: 42000,
        },
        creationDate: '2025-10-16T10:00:00+02:00',
        expirationDate: '2025-10-23T10:00:00+02:00',
        paymentLinkId: 'PLTEST041',
        merchantReference: 'REF-016',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'expired',
    },
    {
        amount: {
            currency: 'NZD',
            value: 28500,
        },
        creationDate: '2025-10-17T10:00:00+02:00',
        expirationDate: '2025-10-24T10:00:00+02:00',
        paymentLinkId: 'PLTEST042',
        merchantReference: 'REF-017',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'expired',
    },
    {
        amount: {
            currency: 'BRL',
            value: 185000,
        },
        creationDate: '2025-10-18T10:00:00+02:00',
        expirationDate: '2025-10-25T10:00:00+02:00',
        paymentLinkId: 'PLTEST043',
        merchantReference: 'REF-018',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'completed',
    },
    {
        amount: {
            currency: 'MXN',
            value: 95000,
        },
        creationDate: '2025-10-19T10:00:00+02:00',
        expirationDate: '2025-10-26T10:00:00+02:00',
        paymentLinkId: 'PLTEST044',
        merchantReference: 'REF-019',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'completed',
    },
    {
        amount: {
            currency: 'ZAR',
            value: 175000,
        },
        creationDate: '2025-10-20T10:00:00+02:00',
        expirationDate: '2025-10-27T10:00:00+02:00',
        paymentLinkId: 'PLTEST045',
        merchantReference: 'REF-020',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'completed',
    },
    {
        amount: {
            currency: 'HKD',
            value: 38000,
        },
        creationDate: '2025-10-21T10:00:00+02:00',
        expirationDate: '2025-10-28T10:00:00+02:00',
        paymentLinkId: 'PLTEST046',
        merchantReference: 'REF-021',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'expired',
    },
    {
        amount: {
            currency: 'INR',
            value: 450000,
        },
        creationDate: '2025-10-22T10:00:00+02:00',
        expirationDate: '2025-10-29T10:00:00+02:00',
        paymentLinkId: 'PLTEST047',
        merchantReference: 'REF-022',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'completed',
    },
    {
        amount: {
            currency: 'AED',
            value: 72000,
        },
        creationDate: '2025-10-23T10:00:00+02:00',
        expirationDate: '2025-10-30T10:00:00+02:00',
        paymentLinkId: 'PLTEST048',
        merchantReference: 'REF-023',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'expired',
    },
    {
        amount: {
            currency: 'THB',
            value: 320000,
        },
        creationDate: '2025-10-24T10:00:00+02:00',
        expirationDate: '2025-10-31T10:00:00+02:00',
        paymentLinkId: 'PLTEST049',
        merchantReference: 'REF-024',
        linkType: 'open',
        shopperEmail: 'shopper@example.com',
        status: 'completed',
    },
    {
        amount: {
            currency: 'KRW',
            value: 5500000,
        },
        creationDate: '2025-10-25T10:00:00+02:00',
        expirationDate: '2025-11-01T10:00:00+02:00',
        paymentLinkId: 'PLTEST050',
        merchantReference: 'REF-025',
        linkType: 'singleUse',
        shopperEmail: 'shopper@example.com',
        status: 'expired',
    },
];

export const ALL_PAYMENT_LINKS = [...ACTIVE_PAYMENT_LINKS, ...INACTIVE_PAYMENT_LINKS];
export const PAYMENT_LINKS_SINGLE = [ACTIVE_PAYMENT_LINKS[0]];

export const PAYMENT_LINKS_LIST_RESPONSE: IPaymentLinksListResponse = {
    _links: {
        prev: {
            cursor: 'S2B-cW9iW32NHKTorUzdcb325wbX1aeVQ4SXwmWGRgKDE8IV9hdGIhTUw34XW5taz1iRWV4NGVsJ1RXWkpYPzcsR0FyZmsyPUouJHcicTslSC5ybSxZWSFoQl1yTmw1LTg6NS9YTGlbakZgW2Bd',
        },
        next: {
            cursor: 'S2B-cW9iW32NHKTorUzdcb325wbX1aeVQ4SXwmWGRgKDE8IV9hdGIhTUw34XW5taz1iRWV4NGVsJ1RXWkpYPzcsR0FyZmsyPUouJHcicTslSC5ybSxZWSFoQl1yTmw1LTg6NS9YTGlbakZgW2Bd',
        },
    },
    data: [...ACTIVE_PAYMENT_LINKS, ...INACTIVE_PAYMENT_LINKS],
};

export const getPaymentLinksByStatusGroup = (status: IPayByLinkStatusGroup) => {
    switch (status) {
        case 'ACTIVE':
            return ACTIVE_PAYMENT_LINKS;
        case 'INACTIVE':
            return INACTIVE_PAYMENT_LINKS;
        default:
            return ALL_PAYMENT_LINKS;
    }
};

export const PAY_BY_LINK_FILTERS = {
    linkTypes: ['singleUse', 'open'],
    statuses: { inactive: ['completed', 'expired'], active: ['active', 'paymentPending'] },
};

import { IPaymentMethod } from '../../../../types';
import { EMPTY_OBJECT } from '../../../../utils';
import { TransactionsFilters } from '../types';
import { INITIAL_FILTERS } from '../constants';

const allFilters = Object.keys(INITIAL_FILTERS) as readonly (keyof TransactionsFilters)[];

const PAYMENT_METHODS = Object.freeze({
    klarna: 'Klarna',
    paypal: 'PayPal',
    klarna_paynow: 'Klarna Pay Now',
});

export const parsePaymentMethodType = (paymentMethod: NonNullable<IPaymentMethod>, format?: 'detail' | 'fourDigit') => {
    const { lastFourDigits, description, type } = paymentMethod ?? EMPTY_OBJECT;
    if (lastFourDigits) return format === 'detail' ? `•••• •••• •••• ${lastFourDigits}` : lastFourDigits;
    return description || PAYMENT_METHODS[type as keyof typeof PAYMENT_METHODS] || type;
};

export const getTransactionsFilterQueryParams = <T extends TransactionsFilters>(filters: T) => {
    return {
        balanceAccountId: filters.balanceAccount?.id!, // using null assertion to ensure correct type inference
        categories: filters.categories as (typeof filters.categories)[number][],
        createdSince: new Date(filters.createdDate.from).toISOString(),
        createdUntil: new Date(filters.createdDate.to).toISOString(),
        currencies: filters.currencies as (typeof filters.currencies)[number][],
        paymentPspReference: filters.paymentPspReference,
        statuses: filters.statuses as (typeof filters.statuses)[number][],
    } as const;
};

export const getTransactionsFilterParams = <T extends TransactionsFilters>(filters: T) => {
    const { balanceAccountId, categories, currencies, statuses, ...restFilterParams } = getTransactionsFilterQueryParams(filters);
    return {
        ...restFilterParams,
        balanceAccountId: balanceAccountId || undefined,
        categories: String(categories) || undefined,
        currencies: String(currencies) || undefined,
        statuses: String(statuses) || undefined,
    } as const;
};

export const compareTransactionsFilters = <T extends TransactionsFilters>(filtersA: T, filtersB: T) => {
    return allFilters.some(filterName => {
        const filterValueA = filtersA[filterName];
        const filterValueB = filtersB[filterName];

        switch (filterName) {
            case 'categories':
            case 'currencies':
            case 'statuses':
                return String(filterValueA) !== String(filterValueB);
            default:
                return filterValueA !== filterValueB;
        }
    });
};

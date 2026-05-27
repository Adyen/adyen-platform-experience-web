import type { ITransaction } from '@integration-components/types';
import { CUSTOM_URL_EXAMPLE } from '@integration-components/testing/storybook-helpers';

const products = ['Coffee', 'Muffin', 'Pie', 'Tea', 'Latte', 'Brownie', 'Iced latte', 'Bubble tea', 'Apple pie', 'Iced tea'];
const getProductById = (id: string) => {
    const numericId = id.replace(/\D/g, '');
    const index = Number(numericId[numericId.length - 1]);
    return {
        value: products[index],
        type: 'text',
    } as const;
};

const stores = [
    { value: 'New York', flag: 'us' },
    { value: 'Chicago', flag: 'us' },
    { value: 'San Francisco', flag: 'us' },
    { value: 'Madrid', flag: 'es' },
    { value: 'Singapore', flag: 'sg' },
    { value: 'Amsterdam', flag: 'nl' },
    { value: 'London', flag: 'gb' },
    { value: 'Sydney', flag: 'au' },
    { value: 'Melbourne', flag: 'au' },
    { value: 'Toronto', flag: 'ca' },
] as const;

const getStoreById = (id: string) => {
    const numericId = id.replace(/\D/g, '');
    const index = Number(numericId[numericId.length - 1]);
    const store = stores[index]!;
    return {
        value: store.value,
        type: 'icon',
        config: { src: `https://flagicons.lipis.dev/flags/4x3/${store.flag}.svg` },
    } as const;
};

const txMatcher = (data: ITransaction[]) =>
    data.map(transaction => ({
        ...transaction,
        _product: getProductById(transaction.id),
        _store: getStoreById(transaction.id),
        _reference: {
            type: 'link',
            value: transaction.id,
            config: { value: '', href: CUSTOM_URL_EXAMPLE },
        } as const,
        _button: {
            type: 'button',
            value: 'Refund',
            config: {
                action: () => console.log('Action'),
            },
        } as const,
    }));

export const getMyCustomData = async (data: ITransaction[]) => {
    const customData = txMatcher(data);
    return customData;
};

export const getCustomTransactionDataById = (id: string) => {
    return {
        _product: getProductById(id),
        _store: getStoreById(id),
        _reference: {
            type: 'link',
            value: id,
            config: { value: '', href: CUSTOM_URL_EXAMPLE },
        } as const,
        _button: {
            type: 'button',
            value: 'Refund',
            config: {
                action: () => console.log('Action'),
            },
        },
    };
};

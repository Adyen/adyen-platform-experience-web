import type { ITransaction } from '@integration-components/types';
import { CUSTOM_URL_EXAMPLE } from '@integration-components/testing/storybook-helpers';

const products = ['Coffee', 'Muffin', 'Pie', 'Tea', 'Latte', 'Brownie', 'Iced latte', 'Bubble tea', 'Apple pie', 'Iced tea'];

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

const getIndex = (id: string) => {
    const numericId = id.replace(/\D/g, '');
    return Number(numericId[numericId.length - 1]);
};

const getProductById = (id: string) => {
    const index = getIndex(id);
    return { value: products[index], type: 'text' } as const;
};

const getStoreById = (id: string) => {
    const index = getIndex(id);
    const store = stores[index]!;
    return { value: store.value, type: 'icon', config: { src: `https://flagicons.lipis.dev/flags/4x3/${store.flag}.svg` } } as const;
};

export const getCustomListData = async (data: ITransaction[]) =>
    data.map(tx => ({
        ...tx,
        _store: getStoreById(tx.id),
        _product: getProductById(tx.id),
        _reference: { type: 'link', value: tx.id, config: { value: '', href: CUSTOM_URL_EXAMPLE } } as const,
        _button: { type: 'button', value: 'Refund', config: { action: () => console.log('Action') } } as const,
    }));

export const getCustomDetailsData = (id: string) => ({
    _store: getStoreById(id),
    _product: getProductById(id),
    _reference: { type: 'link', value: id, config: { value: '', href: CUSTOM_URL_EXAMPLE } } as const,
    _button: { type: 'button', value: 'Refund', config: { action: () => console.log('Action') } } as const,
});

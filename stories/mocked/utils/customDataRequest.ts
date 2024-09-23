import { ITransaction } from '../../../src';

const products = ['Coffee', 'Muffin', 'Pie', 'Tea', 'Latte', 'Brownie', 'Iced latte', 'Bubble tea', 'Apple pie', 'Iced tea'];
const getProductById = (id: string) => {
    const numericId = id.replace(/\D/g, '');
    const index = Number(numericId[numericId.length - 1]);
    return { value: products[index], icon: { url: 'https://img.icons8.com/?size=100&id=43184&format=png&color=000000', alt: products[index] } };
    // return products[index]!;
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
    return { value: store.value, icon: { url: `https://flagicons.lipis.dev/flags/4x3/${store.flag}.svg` } };
};

const txMatcher = (data: ITransaction[]) => data.map(({ id }) => ({ id, _product: getProductById(id), _store: getStoreById(id), _reference: id }));

export const getMyCustomData = async (data: ITransaction[]) => {
    const customData = txMatcher(data);
    return customData;
};

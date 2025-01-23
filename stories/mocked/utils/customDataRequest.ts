import { IPayout, IReport, ITransaction } from '../../../src';

const products = ['Coffee', 'Muffin', 'Pie', 'Tea', 'Latte', 'Brownie', 'Iced latte', 'Bubble tea', 'Apple pie', 'Iced tea'];
const getProductById = (id: string) => {
    const numericId = id.replace(/\D/g, '');
    const index = Number(numericId[numericId.length - 1]);
    return {
        value: products[index],
        type: 'icon',
        details: { url: 'https://img.icons8.com/?size=100&id=43184&format=png&color=000000', alt: products[index] },
    } as const;
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
    return {
        value: store.value,
        type: 'icon',
        details: { url: `https://flagicons.lipis.dev/flags/4x3/${store.flag}.svg` },
    } as const;
};

const txMatcher = (data: ITransaction[]) =>
    data.map(({ id }) => ({
        id,
        _product: getProductById(id),
        _store: getStoreById(id),
        _reference: {
            type: 'link',
            value: id,
            details: { href: `http://localhost:3031/?path=/story/mocked-transactions-overview--custom-columns&reference=${id}` },
        } as const,
        _button: {
            type: 'button',
            value: 'Refund',
            details: {
                action: () => alert('Action'),
            },
        } as const,
    }));

export const getMyCustomData = async (data: ITransaction[]) => {
    const customData = txMatcher(data);
    return customData;
};

export const getCustomReportsData = async (data: IReport[]) => {
    return data.map(({ createdAt, type }, index) => {
        return {
            createdAt,
            type,
            _summary: {
                type: 'link',
                value: 'Summary',
                details: {
                    href: `http://localhost:3031/?path=/story/mocked-reports-overview--custom-columns&summary=${index}`,
                },
            },
            _sendEmail: {
                type: 'button',
                value: 'Send email',
                details: {
                    action: () => alert('Action'),
                },
            },
        } as const;
    });
};

export const getCustomPayoutsData = async (data: IPayout[]) => {
    return data.map(({ createdAt }, index) => {
        return {
            createdAt,
            _summary: {
                type: 'link',
                value: 'Summary',
                details: {
                    href: `http://localhost:3031/?path=/story/mocked-reports-overview--custom-columns&summary=${index}`,
                },
            },
            _sendEmail: {
                type: 'button',
                value: 'Send email',
                details: {
                    action: () => alert('Action'),
                },
            },
        } as const;
    });
};

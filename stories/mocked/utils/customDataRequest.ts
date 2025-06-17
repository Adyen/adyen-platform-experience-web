import { IPayout, IReport, ITransaction } from '../../../src';
import { CUSTOM_URL_EXAMPLE } from '../../utils/constants';
import { IDispute } from '../../../src/types/api/models/disputes';

const products = ['Coffee', 'Muffin', 'Pie', 'Tea', 'Latte', 'Brownie', 'Iced latte', 'Bubble tea', 'Apple pie', 'Iced tea'];
const getProductById = (id: string) => {
    const numericId = id.replace(/\D/g, '');
    const index = Number(numericId[numericId.length - 1]);
    return {
        value: products[index],
        type: 'text',
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

export const getCustomReportsData = async (data: IReport[]) => {
    return data.map(report => {
        return {
            ...report,
            _summary: {
                type: 'link',
                value: 'Summary',
                config: {
                    href: CUSTOM_URL_EXAMPLE,
                },
            },
            _sendEmail: {
                type: 'button',
                value: 'Send email',
                config: {
                    action: () => console.log('Action'),
                },
            },
        } as const;
    });
};

export const getCustomDisputesData = async (data: IDispute[]) => {
    return data.map(dispute => {
        return {
            ...dispute,
            _summary: {
                type: 'link',
                value: 'Summary',
                config: {
                    href: CUSTOM_URL_EXAMPLE,
                },
            },
            _sendEmail: {
                type: 'button',
                value: 'Send email',
                config: {
                    action: () => console.log('Action'),
                },
            },
        } as const;
    });
};

export const getCustomPayoutsData = async (data: IPayout[]) => {
    return data.map(payouts => {
        return {
            ...payouts,
            _summary: {
                type: 'link',
                value: 'Summary',
                config: {
                    href: CUSTOM_URL_EXAMPLE,
                },
            },
            _sendEmail: {
                type: 'button',
                value: 'Send email',
                config: {
                    action: () => console.log('Action'),
                },
            },
            _country: {
                type: 'icon',
                value: '',
                config: {
                    src: `https://flagicons.lipis.dev/flags/4x3/es.svg`,
                    alt: '',
                },
            },
        } as const;
    });
};

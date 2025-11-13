import { TransactionsOverview } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { http, HttpResponse } from 'msw';
import { TransactionsOverviewMeta } from '../components/transactionsOverview';
import { Meta } from '@storybook/preact';
import { endpoints } from '../../endpoints/endpoints';
import { getCustomTransactionDataById, getMyCustomData } from './utils/customDataRequest';
import { TRANSACTIONS } from '../../mocks/mock-data';
import { SearchBar } from '../../src/components/internal/SearchBar/SearchBar';
import InputBase from '../../src/components/internal/FormFields/InputBase';

const meta: Meta<ElementProps<typeof TransactionsOverview>> = { ...TransactionsOverviewMeta, title: 'Mocked/Transactions Overview' };
export const Default: ElementStory<typeof TransactionsOverview> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

const CUSTOM_COLUMNS_MOCK_HANDLER = {
    handlers: [
        http.get(endpoints('mock').transactions, () => {
            return HttpResponse.json({
                data: [
                    { ...TRANSACTIONS[0], createdAt: Date.now() },
                    { ...TRANSACTIONS[4], createdAt: Date.now() },
                    { ...TRANSACTIONS[6], createdAt: Date.now() },
                    { ...TRANSACTIONS[8], createdAt: Date.now() },
                    { ...TRANSACTIONS[10], createdAt: Date.now() },
                ],
                _links: {},
            });
        }),
    ],
};
export const DataCustomization: ElementStory<typeof TransactionsOverview> = {
    name: 'Data customization',
    args: {
        coreOptions: {
            translations: {
                en_US: {
                    _store: 'Store',
                    _product: 'Product',
                    _reference: 'Reference',
                    _button: 'Action',
                    _country: 'Country',
                    _summary: 'Summary',
                },
            },
        },
        mockedApi: true,
        dataCustomization: {
            list: {
                fields: [
                    {
                        key: '_store',
                        flex: 1.5,
                    },
                    { key: '_product' },
                    { key: '_reference', flex: 1.5 },
                    { key: 'transactionType', visibility: 'hidden' },
                    { key: 'amount', flex: 2 },
                    { key: '_button', flex: 1.5, align: 'right' },
                ],
                onDataRetrieve: data => {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve(getMyCustomData(data));
                        }, 200);
                    });
                },
            },
            details: {
                fields: [
                    { key: 'paymentPspReference', visibility: 'hidden' },
                    { key: '_store' },
                    { key: '_product' },
                    { key: '_reference' },
                    { key: '_summary' },
                    { key: '_button' },
                    { key: '_country' },
                ],
                onDataRetrieve: data => {
                    return new Promise(resolve => {
                        return resolve(getCustomTransactionDataById(data?.id));
                    });
                },
            },
        },
    },
    parameters: {
        msw: CUSTOM_COLUMNS_MOCK_HANDLER,
    },
};

export const TestInternalComponent: ElementStory<typeof TransactionsOverview> = {
    name: 'Test Internal Component',
    decorators: () => {
        return (
            <InputBase
                dropdown={{
                    items: [
                        { id: 'EUR', name: 'EUR' },
                        { id: 'USD', name: 'USD' },
                    ],
                    value: 'EUR',
                    'aria-label': 'Currency selector',
                }}
                onDropdownInput={(value: any) => console.log('Dropdown changed:', value)}
                value="Entered Text"
                type={'number'}
                placeholder="Enter amount"
            />
        );
    },
};

export default meta;

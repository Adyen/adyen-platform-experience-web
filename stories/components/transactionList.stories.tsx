import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { TransactionsOverview } from '../../src';
import { ElementProps, ElementStory, SessionControls } from '../utils/types';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';

const meta: Meta<ElementProps<typeof TransactionsOverview>> = {
    title: 'components/Transactions',
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onRecordSelection: enabledDisabledCallbackRadioControls('onRecordSelection'),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { type: 'boolean' },
        preferredLimit: { type: 'number', min: 1, max: 100 },
        allowLimitSelection: { type: 'boolean' },
    },
    args: {
        preferredLimit: 10,
        allowLimitSelection: true,
        hideTitle: false,
        onContactSupport: () => {},
        component: TransactionsOverview,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
export const Basic: ElementStory<typeof TransactionsOverview> = {
    name: 'Basic (Mocked)',
    args: {
        mockedApi: true,
    },
};

export const BasicTransactionListApi: ElementStory<typeof TransactionsOverview, SessionControls> = {
    name: 'Basic (API)',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

/*Basic.parameters = {
    msw: {
        handlers: [
            http.get('https://platform-components-external-test.adyen.com/platform-components-external/api/v1/transactions', r => {
                return HttpResponse.json({
                    data: [
                        {
                            id: '1VVF0D5V3709DX6D',
                            amount: { currency: 'EUR', value: 200000 },
                            balanceAccountId: '',
                            status: 'Booked',
                            category: 'Fee',
                            paymentMethod: { lastFourDigits: '1945', type: 'mc' },
                            createdAt: '2024-07-29T14:47:03+02:00',
                        },
                    ],
                    _links: {},
                });
            }),
        ],
    },
};*/

export default meta;

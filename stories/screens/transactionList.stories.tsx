import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { TransactionsOverview } from '../../src';
import { ElementProps, ElementStory, SessionControls } from '../utils/types';
import { Container } from '../utils/Container';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';
import { getMyCustomData } from '../utils/customDataRequest';

const meta: Meta<ElementProps<typeof TransactionsOverview>> = {
    title: 'screens/Transactions',
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
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
    render: (args, context) => {
        if (context.loaded.data) {
            Object.assign(args, { transactions: context.loaded.data });
        }

        return <Container component={TransactionsOverview} componentConfiguration={args} context={context} mockedApi={args.mockedApi} />;
    },
};
export const Basic: ElementStory<typeof TransactionsOverview> = {
    name: 'Basic (Mocked)',
    args: {
        mockedApi: true,
        customColumns: ['amount', 'paymentMethod', 'transactionType', '_store', '_product', 'createdAt'],
        /*customColumns: [
            { key: 'amount', flex: 1, align: 'left', mobile: true },
            { key: 'paymentMethod', flex: 1.5, align: 'left' },
            { key: 'transactionType', flex: 2, align: 'left', mobile: true },
            { key: 'createdAt', flex: 1, align: 'right' },
        ],*/
        onDataRetrieved: data => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(getMyCustomData(data));
                }, 4500);
            });
        },
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

export default meta;

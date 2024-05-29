import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { TransactionsOverview } from '@adyen/adyen-platform-experience-web';
import { ElementProps, ElementStory, SessionControls } from '../utils/types';
import { Container } from '../utils/Container';

const meta: Meta<ElementProps<typeof TransactionsOverview>> = {
    title: 'screens/Transactions',
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onRecordSelection: enabledDisabledCallbackRadioControls('onRecordSelection'),
        onLimitChanged: enabledDisabledCallbackRadioControls('onLimitChanged', ['Passed', 'Not Passed']),
        onContactSupport: enabledDisabledCallbackRadioControls('onTransactionSelected'),
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
    },
};

export const BasicTransactionListApi: ElementStory<typeof TransactionsOverview, SessionControls> = {
    name: 'Basic (API)',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: { roles: [], accountHolderId: '' },
    },
};

export default meta;

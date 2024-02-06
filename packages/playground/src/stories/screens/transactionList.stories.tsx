import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { TransactionsComponent } from '@adyen/adyen-fp-web';
import { ElementProps, ElementStory } from '../utils/types';
import { Container } from '../utils/Container';

const meta: Meta<ElementProps<typeof TransactionsComponent>> = {
    title: 'screens/Transactions',
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onTransactionSelected: enabledDisabledCallbackRadioControls('onTransactionSelected'),
        onLimitChanged: enabledDisabledCallbackRadioControls('onLimitChanged', ['Passed', 'Not Passed']),
        preferredLimit: { type: 'number', min: 1, max: 100 },
        allowLimitSelection: { type: 'boolean' },
    },
    args: {
        preferredLimit: 10,
        allowLimitSelection: true,
        withTitle: true,
    },
    render: (args, context) => {
        if (context.loaded.data) {
            Object.assign(args, { transactions: context.loaded.data });
        }

        return <Container component={TransactionsComponent} componentConfiguration={args} context={context} mockedApi={args.mockedApi} />;
    },
};
export const Basic: ElementStory<typeof TransactionsComponent> = {
    name: 'Basic (Mocked)',
    args: {
        mockedApi: true,
    },
};

export const BasicTransactionListApi: ElementStory<typeof TransactionsComponent> = {
    name: 'Basic (API)',
    args: {},
};

export default meta;

import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { PayoutsOverview } from '@adyen/adyen-platform-experience-web';
import { ElementProps, ElementStory } from '../utils/types';
import { Container } from '../utils/Container';

const meta: Meta<ElementProps<typeof PayoutsOverview>> = {
    title: 'screens/Payouts',
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onDataSelection: enabledDisabledCallbackRadioControls('onDataSelection'),
        onLimitChanged: enabledDisabledCallbackRadioControls('onLimitChanged', ['Passed', 'Not Passed']),
        onContactSupport: enabledDisabledCallbackRadioControls('onTransactionSelected'),
        preferredLimit: { type: 'number', min: 1, max: 100 },
        hideTitle: { type: 'boolean' },
        allowLimitSelection: { type: 'boolean' },
    },
    args: {
        preferredLimit: 10,
        allowLimitSelection: true,
        hideTitle: false,
        onContactSupport: () => {},
    },
    render: (args, context) => {
        if (context.loaded.data) {
            Object.assign(args, { payouts: context.loaded.data });
        }

        return <Container component={PayoutsOverview} componentConfiguration={args} context={context} mockedApi={args.mockedApi} />;
    },
};
export const Basic: ElementStory<typeof PayoutsOverview> = {
    name: 'Basic (Mocked)',
    args: {
        mockedApi: true,
    },
};

export const BasicTransactionListApi: ElementStory<typeof PayoutsOverview> = {
    name: 'Basic (API)',
    args: {},
};

export default meta;

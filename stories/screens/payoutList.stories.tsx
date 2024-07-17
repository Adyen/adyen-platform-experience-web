import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { PayoutsOverview } from '../../src';
import { ElementProps, ElementStory, SessionControls as SessionControl } from '../utils/types';
import { Container } from '../utils/Container';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';

const meta: Meta<ElementProps<typeof PayoutsOverview>> = {
    title: 'screens/Payouts',
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onRecordSelection: enabledDisabledCallbackRadioControls('onRecordSelection'),
        onLimitChanged: enabledDisabledCallbackRadioControls('onLimitChanged', ['Passed', 'Not Passed']),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
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
    parameters: {
        controls: {
            sort: 'alpha',
        },
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

export const BasicPayoutListApi: ElementStory<typeof PayoutsOverview, SessionControl> = {
    name: 'Basic (API)',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

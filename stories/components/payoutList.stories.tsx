import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { PayoutsOverview } from '../../src';
import { ElementProps, ElementStory, SessionControls as SessionControl } from '../utils/types';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';

const meta: Meta<ElementProps<typeof PayoutsOverview>> = {
    title: 'components/Payouts',
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onRecordSelection: enabledDisabledCallbackRadioControls('onRecordSelection'),
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
        component: PayoutsOverview,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
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

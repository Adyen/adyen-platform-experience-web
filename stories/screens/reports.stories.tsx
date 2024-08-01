import { Meta } from '@storybook/preact';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { ReportsOverview } from '../../src';
import { ElementProps, ElementStory, SessionControls } from '../utils/types';
import { Container } from '../utils/Container';

const meta: Meta<ElementProps<typeof ReportsOverview>> = {
    title: 'screens/Reports',
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
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
            Object.assign(args, { reports: context.loaded.data });
        }

        return <Container component={ReportsOverview} componentConfiguration={args} context={context} mockedApi={args.mockedApi} />;
    },
};
export const Basic: ElementStory<typeof ReportsOverview> = {
    name: 'Basic (Mocked)',
    args: {
        mockedApi: true,
    },
};

export const BasicReportsListApi: ElementStory<typeof ReportsOverview, SessionControls> = {
    name: 'Basic (API)',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

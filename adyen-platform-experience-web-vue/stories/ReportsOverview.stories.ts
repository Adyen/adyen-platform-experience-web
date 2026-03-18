import type { Meta, StoryObj } from '@storybook/vue3';
import ReportsOverview from '../src/components/ReportsOverview/ReportsOverviewWrapper.vue';
import type { ReportsOverviewExternalProps } from '../src/components/ReportsOverview/types';
import Container from './utils/Container.vue';
import { enabledDisabledCallbackRadioControls } from './utils/controls';
import { EMPTY_SESSION_OBJECT } from './utils/constants';

type StoryArgs = Omit<ReportsOverviewExternalProps, 'core'> & {
    locale?: string;
    session?: { roles: string[]; accountHolderId?: string };
};

const meta: Meta<StoryArgs> = {
    title: 'Components/Reports/Reports Overview',
    component: Container,
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        preferredLimit: { control: { type: 'number', min: 1, max: 100 } },
        hideTitle: { control: 'boolean' },
        allowLimitSelection: { control: 'boolean' },
        session: { control: 'object' },
        locale: {
            control: 'select',
            options: ['da-DK', 'de-DE', 'en-US', 'es-ES', 'fi-FI', 'fr-FR', 'it-IT', 'nl-NL', 'no-NO', 'pt-BR', 'sv-SE'],
        },
    },
    args: {
        allowLimitSelection: true,
        locale: 'en-US',
        session: EMPTY_SESSION_OBJECT,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
    render: (args: any) => ({
        components: { Container },
        setup() {
            const { locale, session, ...componentProps } = args;
            return { ReportsOverview, locale, session, componentProps };
        },
        template: `<Container :component="ReportsOverview" :component-props="componentProps" :locale="locale" :session="session" />`,
    }),
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    name: 'Default',
};

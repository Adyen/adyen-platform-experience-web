import type { Meta } from '@storybook/vue3';
import ReportsOverview from '../../src/components/ReportsOverview/ReportsOverviewWrapper.vue';
import Container from '../utils/Container.vue';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import type { ReportsOverviewExternalProps } from '../../src/components/ReportsOverview/types';

export type ReportsOverviewStoryArgs = Omit<ReportsOverviewExternalProps, 'core'> & {
    locale?: string;
    session?: { roles: string[]; accountHolderId?: string };
    mockedApi?: boolean;
};

export const ReportsOverviewComponent = ReportsOverview;

export const ReportsOverviewMeta: Meta<ReportsOverviewStoryArgs> = {
    title: 'Components/Reports/Reports Overview',
    component: Container,
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        preferredLimit: { control: { type: 'number', min: 1, max: 100 } },
        hideTitle: { control: 'boolean' },
        allowLimitSelection: { control: 'boolean' },
        locale: {
            control: 'select',
            options: ['da-DK', 'de-DE', 'en-US', 'es-ES', 'fi-FI', 'fr-FR', 'it-IT', 'nl-NL', 'no-NO', 'pt-BR', 'sv-SE'],
        },
    },
    args: {
        allowLimitSelection: true,
        locale: 'en-US',
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
    render: (args: any) => ({
        components: { Container },
        setup() {
            const { locale, session, mockedApi, ...componentProps } = args;
            return { ReportsOverview, locale, session, mockedApi, componentProps };
        },
        template: `<Container :component="ReportsOverview" :component-props="componentProps" :locale="locale" :session="session" :mocked-api="mockedApi" />`,
    }),
};

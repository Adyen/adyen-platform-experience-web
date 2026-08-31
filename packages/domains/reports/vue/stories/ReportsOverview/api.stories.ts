import type { Meta } from '@storybook/vue3';
import { ReportsOverviewMeta } from './meta';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';
import type { ReportsOverviewDomainProps } from '../../src/definitions';

const meta: Meta<ElementProps<ReportsOverviewDomainProps>> = {
    ...ReportsOverviewMeta,
    title: 'API-connected/Reports/Reports Overview',
};

export const Default: ElementStory<ReportsOverviewDomainProps, SessionControls> = {
    name: 'Default',
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory, SessionControls } from '../utils/types';
import { ReportsOverview } from '../../src';
import { ReportsMeta } from '../components/reportsOverview';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';

const meta: Meta<ElementProps<typeof ReportsOverview>> = { ...ReportsMeta, title: 'Integration/Reports Overview' };

export const Default: ElementStory<typeof ReportsOverview, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

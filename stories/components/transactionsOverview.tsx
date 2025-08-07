import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { TransactionsOverview } from '../../src';
import { ElementProps } from '../utils/types';

export const TransactionsOverviewMeta: Meta<ElementProps<typeof TransactionsOverview>> = {
    args: {
        allowLimitSelection: true,
        component: TransactionsOverview,
    },
};

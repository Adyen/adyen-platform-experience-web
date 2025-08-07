import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { PayoutDetails } from '../../src';
import { ElementProps } from '../utils/types';

export const PayoutDetailsMeta: Meta<ElementProps<typeof PayoutDetails>> = {
    args: {
        component: PayoutDetails,
    },
    decorators: [Story => <div style={{ margin: 'auto', maxWidth: 500, width: '100%' }}>{Story()}</div>],
};

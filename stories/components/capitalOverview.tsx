import { Meta } from '@storybook/preact';
import { ElementProps } from '../utils/types';
import { CapitalOverview } from '../../src';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { action } from '@storybook/addon-actions';

export const CapitalOverviewMeta: Meta<ElementProps<typeof CapitalOverview>> = {
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { type: 'boolean' },
    },
    args: {
        hideTitle: false,
        onContactSupport: action('onContactSupport'),
        component: CapitalOverview,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
    decorators: [
        (Story, context) => (context.args.skipDecorators ? Story() : <div style={{ margin: 'auto', maxWidth: 600, width: '100%' }}>{Story()}</div>),
    ],
};

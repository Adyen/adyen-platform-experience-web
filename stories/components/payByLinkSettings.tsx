import { Meta } from '@storybook/preact';
import { PayByLinkSettings } from '../../src';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { ElementProps } from '../utils/types';

export const PayByLinkSettingsMeta: Meta<ElementProps<typeof PayByLinkSettings>> = {
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { type: 'boolean' },
    },
    args: {
        component: PayByLinkSettings,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
    decorators: [Story => <div style={{ margin: 'auto', maxWidth: 800 }}>{Story() as JSX.Element}</div>],
};

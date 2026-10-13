import type { Meta } from '@storybook/vue3';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import type { DisputesOverviewExternalProps } from '../../src';
import DisputesOverviewElement from '../../src/DisputesOverview/DisputesOverviewElement';

export const disputesOverviewMeta: Meta<ElementProps<DisputesOverviewExternalProps>> = {
    title: 'Components/Disputes/Disputes Overview',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onRecordSelection: enabledDisabledCallbackRadioControls('onRecordSelection'),
        pagination: { control: 'object' },
    },
    args: {
        component: DisputesOverviewElement,
        pagination: { initialPageSize: 10, allowPageSizeSelection: true },
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

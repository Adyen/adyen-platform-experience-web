import { ElementProps } from '@integration-components/testing/storybook-helpers';
import type { Meta } from '@storybook/vue3';
import { CashOutRequestElement } from '../../src';

export const cashOutRequestMeta: Meta<ElementProps<typeof CashOutRequestElement>> = {
    args: {
        component: CashOutRequestElement,
        compact: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

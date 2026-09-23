import type { UIElementProps } from '@integration-components/core/vue';
import type { ComponentAppearance } from '@integration-components/types';
import type { PayoutDetailsProps } from '../../../domain/src';

export type { PayoutDetailsCustomization } from '../../../domain/src';

export type PayoutDetailsAppearance = ComponentAppearance<'dataGrid'>;

export type PayoutDetailsExternalProps = Omit<PayoutDetailsProps, 'ref'> &
    UIElementProps & {
        appearance?: PayoutDetailsAppearance;
    };

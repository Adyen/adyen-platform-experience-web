import { UIElement } from '@integration-components/core/vue';
import CashOutRequestContainer from './components/CashOutRequestContainer.vue';
import type { CashOutRequestExternalProps } from './types';

export class CashOutRequestElement extends UIElement<CashOutRequestExternalProps> {
    public static readonly type = 'cashOutRequest' as const;

    constructor(props: CashOutRequestExternalProps) {
        super(CashOutRequestContainer, props, 'cashOutRequest');
    }
}

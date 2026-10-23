import { UIElement } from '@integration-components/core/vue';
import CashOutRequestContainer from './components/CashOutRequestContainer.vue';
import type { CashOutRequestExternalProps } from './types';
import type { ExternalComponentType } from '@integration-components/types';

export class CashOutRequestElement extends UIElement<CashOutRequestExternalProps> {
    public static readonly type: ExternalComponentType = 'cashOutRequest';

    constructor(props: CashOutRequestExternalProps) {
        super(CashOutRequestContainer, props, 'cashOutRequest');
    }
}

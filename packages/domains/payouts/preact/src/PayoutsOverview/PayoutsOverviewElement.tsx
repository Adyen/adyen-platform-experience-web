import type { ExternalComponentType, _UIComponentProps } from '@integration-components/types';
import type { PayoutsOverviewComponentProps } from '@integration-components/payouts/domain';
import { UIElement } from '@integration-components/core/preact';
import Payouts from './components/PayoutsOverviewContainer/PayoutsOverviewContainer';

export class PayoutsElement extends UIElement<PayoutsOverviewComponentProps> {
    public static type: ExternalComponentType = 'payouts';

    constructor(props: _UIComponentProps<PayoutsOverviewComponentProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <Payouts {...this.props} />;
    };
}

export default PayoutsElement;

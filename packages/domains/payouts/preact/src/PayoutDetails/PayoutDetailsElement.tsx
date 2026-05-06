import type { ExternalComponentType, _UIComponentProps } from '@integration-components/types';
import type { PayoutDetailsProps } from '@integration-components/payouts/domain';
import { UIElement } from '@integration-components/core/preact';
import DataOverviewDetails from '../internal/DataOverviewDetails/DataOverviewDetails';

export class PayoutElement extends UIElement<PayoutDetailsProps> {
    public static type: ExternalComponentType = 'payoutDetails';

    constructor(props: _UIComponentProps<PayoutDetailsProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <DataOverviewDetails {...this.props} type="payout" />;
    };
}

export default PayoutElement;

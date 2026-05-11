import type { _UIComponentProps, ExternalComponentType } from '@integration-components/types';
import Disputes from './components/DisputesContainer/DisputesContainer';
import { UIElement } from '@integration-components/core/preact';
import { DisputeOverviewComponentProps } from './types';

export class DisputesOverviewElement extends UIElement<DisputeOverviewComponentProps> {
    public static type: ExternalComponentType = 'disputes';

    constructor(props: _UIComponentProps<DisputeOverviewComponentProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <Disputes {...this.props} />;
    };
}

export default DisputesOverviewElement;

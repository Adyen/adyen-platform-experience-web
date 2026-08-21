import { _UIComponentProps, ExternalComponentType } from '@integration-components/types';
import { UIElement } from '@integration-components/core/preact';
import { CapitalComponentState, CapitalOverviewProps } from './types';
import { CapitalOverview } from './components/CapitalOverview/CapitalOverview';
import { getCapitalState } from '../utils/capital/getCapitalState';

export class CapitalOverviewElement extends UIElement<CapitalOverviewProps> {
    public static type: ExternalComponentType = 'capitalOverview';

    constructor(props: _UIComponentProps<CapitalOverviewProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
        this.customClassNames = 'adyen-pe-capital-overview-component';
    }

    public componentToRender = () => {
        return <CapitalOverview {...this.props} />;
    };

    public async getState(): Promise<CapitalComponentState> {
        const { session, getCdnConfig } = this.props.core;
        return await getCapitalState(session, getCdnConfig);
    }
}

export default CapitalOverviewElement;

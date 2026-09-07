import { _UIComponentProps, ExternalComponentType } from '@integration-components/types';
import { UIElement } from '@integration-components/core/preact';
import { ExternalCapitalState, getExternalCapitalState } from '@integration-components/capital/domain';
import { CapitalOverviewProps } from './types';
import { CapitalOverview } from './components/CapitalOverview/CapitalOverview';

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

    public async getState(): Promise<ExternalCapitalState> {
        const { session, getCdnConfig } = this.props.core;
        return await getExternalCapitalState(session, getCdnConfig);
    }
}

export default CapitalOverviewElement;

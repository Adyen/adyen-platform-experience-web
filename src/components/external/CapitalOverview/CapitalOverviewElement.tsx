import { _UIComponentProps } from '../../types';
import UIElement from '../UIElement/UIElement';
import { CapitalComponentStatus, CapitalOverviewProps } from './types';
import { CapitalOverview } from './components/CapitalOverview/CapitalOverview';
import type { SetupContext } from '../../../core/Auth';
import { EMPTY_OBJECT } from '../../../utils';

export class CapitalOverviewElement extends UIElement<CapitalOverviewProps> {
    public static type = 'capitalOverview';

    constructor(props: _UIComponentProps<CapitalOverviewProps>) {
        super(props);
        this.endpoints = props as any;
        this.componentToRender = this.componentToRender.bind(this);
    }

    private readonly endpoints?: SetupContext['endpoints'] = undefined;

    public componentToRender = () => {
        return <CapitalOverview {...this.props} ref={(ref: UIElement<CapitalOverviewProps>) => void (this.componentRef = ref)} />;
    };

    public async getState(): Promise<CapitalComponentStatus> {
        const { getGrants, getDynamicGrantOffersConfiguration } = this.endpoints ?? {};

        const grants = await getGrants?.(EMPTY_OBJECT);
        const config = await getDynamicGrantOffersConfiguration?.(EMPTY_OBJECT);

        console.log(this.endpoints);
        console.log('grants', grants);
        console.log('config', config);

        return 'NotQualified';
    }
}

export default CapitalOverviewElement;

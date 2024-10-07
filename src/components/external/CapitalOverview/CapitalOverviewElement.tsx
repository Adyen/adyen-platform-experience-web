import { _UIComponentProps } from '../../types';
import UIElement from '../UIElement/UIElement';
import { CapitalComponentStatus, CapitalOverviewProps } from './types';
import { CapitalOverview } from './components/CapitalOverview/CapitalOverview';
import { EMPTY_OBJECT } from '../../../utils';

export class CapitalOverviewElement extends UIElement<CapitalOverviewProps> {
    public static type = 'capitalOverview';

    constructor(props: _UIComponentProps<CapitalOverviewProps>) {
        super(props);

        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <CapitalOverview {...this.props} ref={(ref: UIElement<CapitalOverviewProps>) => void (this.componentRef = ref)} />;
    };

    public async getState(): Promise<CapitalComponentStatus> {
        const http = this.props.core.session.context.http;

        const { getGrants, getDynamicGrantOffersConfiguration } = /* this.props.core.session.context.endpoints || {} */ {
            getGrants: async (options: any) =>
                await http?.({ method: 'GET', loadingContext: this.props.core.loadingContext, path: '/capital/grants' }),
            getDynamicGrantOffersConfiguration: async (options: any) =>
                await http?.({ method: 'GET', loadingContext: this.props.core.loadingContext, path: '/capital/grantOffers/dynamic/configuration' }),
        };

        const grants = await getGrants(EMPTY_OBJECT);
        const config = await getDynamicGrantOffersConfiguration?.(EMPTY_OBJECT);

        if (grants.data.length > 0 || (config && config.minAmount)) {
            return 'OfferAvailable';
        } else if (grants.data.length === 0 && (!config || !config.minAmount)) {
            return 'NotQualified';
        }

        return 'NotQualified';
    }
}

export default CapitalOverviewElement;

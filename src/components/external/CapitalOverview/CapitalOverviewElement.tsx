import { _UIComponentProps } from '../../types';
import UIElement from '../UIElement/UIElement';
import sessionReady from '../../utils/sessionReady';
import { CapitalComponentStatus, CapitalOverviewProps } from './types';
import { CapitalOverview } from './components/CapitalOverview/CapitalOverview';
import { EMPTY_OBJECT, noop } from '../../../utils';

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
        const { session } = this.props.core;
        await sessionReady(session);

        const { getDynamicGrantOffersConfiguration, getGrants } = session.context.endpoints;

        const [config, grants] = await Promise.all([
            getDynamicGrantOffersConfiguration?.(EMPTY_OBJECT).catch(noop as () => undefined),
            getGrants?.(EMPTY_OBJECT).catch(noop as () => undefined),
        ]);

        return (grants && grants.data.length! > 0) || (config && config.minAmount) ? 'OfferAvailable' : 'NotQualified';
    }
}

export default CapitalOverviewElement;

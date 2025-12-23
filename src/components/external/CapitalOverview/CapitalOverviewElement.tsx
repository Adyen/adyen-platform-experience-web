import { isCapitalRegionSupported } from '../../internal/CapitalHeader/helpers';
import { _UIComponentProps, ExternalComponentType } from '../../types';
import UIElement from '../UIElement/UIElement';
import { CapitalComponentState, CapitalOverviewProps } from './types';
import { CapitalOverview } from './components/CapitalOverview/CapitalOverview';
import { EMPTY_OBJECT, noop } from '../../../utils';
import sessionReady from '../../../core/ConfigContext/session/utils/sessionReady';

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
        const { session } = this.props.core;
        await sessionReady(session);

        const { getDynamicGrantOffersConfiguration, getGrants } = session.context.endpoints;
        const legalEntity = session.context.extraConfig?.legalEntity;

        if (!isCapitalRegionSupported(legalEntity)) {
            return { state: 'isInUnsupportedRegion' };
        }

        const [config, grants] = await Promise.all([
            getDynamicGrantOffersConfiguration?.(EMPTY_OBJECT).catch(noop as () => undefined),
            getGrants?.(EMPTY_OBJECT).catch(noop as () => undefined),
        ]);

        let state: CapitalComponentState['state'] = 'isUnqualified';

        if (grants && grants.data?.length > 0) {
            state = 'hasRequestedGrants';
        } else if (config && config.minAmount) {
            state = 'isPreQualified';
        }

        return { state };
    }
}

export default CapitalOverviewElement;

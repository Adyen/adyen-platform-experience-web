import { _UIComponentProps, ExternalComponentType } from '../../types';
import UIElement from '../UIElement/UIElement';
import { CapitalComponentState, CapitalOverviewProps } from './types';
import { CapitalOverview } from './components/CapitalOverview/CapitalOverview';
import { EMPTY_OBJECT, noop } from '../../../utils';
import sessionReady from '../../../core/Auth/session/utils/sessionReady';

export class CapitalOverviewElement extends UIElement<CapitalOverviewProps> {
    public static type: ExternalComponentType = 'capitalOverview';

    constructor(props: _UIComponentProps<CapitalOverviewProps>) {
        super(props);

        this.maxWidth = 600;
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <CapitalOverview {...this.props} ref={(ref: UIElement<CapitalOverviewProps>) => void (this.componentRef = ref)} />;
    };

    public async getState(): Promise<CapitalComponentState> {
        const { session } = this.props.core;
        await sessionReady(session);

        const { getDynamicGrantOffersConfiguration, getGrants } = session.context.endpoints;

        const [config, grants] = await Promise.all([
            getDynamicGrantOffersConfiguration?.(EMPTY_OBJECT).catch(noop as () => undefined),
            getGrants?.(EMPTY_OBJECT).catch(noop as () => undefined),
        ]);

        return grants && grants.data?.length > 0 ? 'GrantList' : config && config.minAmount ? 'PreQualified' : 'Unqualified';
    }
}

export default CapitalOverviewElement;

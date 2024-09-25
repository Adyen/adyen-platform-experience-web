import { _UIComponentProps } from '../../types';
import UIElement from '../UIElement/UIElement';
import { CapitalOverviewProps } from './types';
import { CapitalOverview } from './components/CapitalOverview';

export class CapitalOverviewElement extends UIElement<CapitalOverviewProps> {
    public static type = 'capitalOverview';

    constructor(props: _UIComponentProps<CapitalOverviewProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <CapitalOverview {...this.props} ref={(ref: UIElement<CapitalOverviewProps>) => void (this.componentRef = ref)} />;
    };
}

export default CapitalOverviewElement;

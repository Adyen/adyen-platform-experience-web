import { _UIComponentProps, DisputeOverviewComponentProps, ExternalComponentType } from '../../types';
import Disputes from './components/DisputesContainer/DisputesContainer';
import UIElement from '../UIElement/UIElement';

export class DisputesOverviewElement extends UIElement<DisputeOverviewComponentProps> {
    public static type: ExternalComponentType = 'disputes';

    constructor(props: _UIComponentProps<DisputeOverviewComponentProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return (
            <Disputes
                {...this.props}
                balanceAccountId={this.props.balanceAccountId}
                ref={(ref: UIElement<DisputeOverviewComponentProps>) => void (this.componentRef = ref)}
            ></Disputes>
        );
    };
}

export default DisputesOverviewElement;

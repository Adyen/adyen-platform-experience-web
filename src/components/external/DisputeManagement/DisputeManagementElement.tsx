import { _UIComponentProps, ExternalComponentType } from '../../types';
import UIElement from '../UIElement/UIElement';
import { DisputeManagementProps } from './types';
import { DisputeDetailsContainer } from './components/DisputeDetailsContainer/DisputeDetailsContainer';

export class DisputeManagementElement extends UIElement<DisputeManagementProps> {
    public static type: ExternalComponentType = 'disputesManagement';

    constructor(props: _UIComponentProps<DisputeManagementProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <DisputeDetailsContainer {...this.props} />;
    };
}

export default DisputeManagementElement;

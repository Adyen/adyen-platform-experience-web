import { _UIComponentProps, ExternalComponentType } from '../../types';
import UIElement from '../UIElement/UIElement';
import { DisputeManagementProps } from './types';
import { DisputeDetails } from './components/DisputeDetails/DisputeDetails';

export class DisputeManagementElement extends UIElement<DisputeManagementProps> {
    public static type: ExternalComponentType = 'disputesManagement';

    constructor(props: _UIComponentProps<DisputeManagementProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <DisputeDetails {...this.props} />;
    };
}

export default DisputeManagementElement;

import { _UIComponentProps, ExternalComponentType } from '../../types';
import UIElement from '../UIElement/UIElement';
import { DisputeManagement } from './components/DisputeManagement';
import { DisputesManagementProps } from './types';

export class DisputeManagementElement extends UIElement<DisputesManagementProps> {
    public static type: ExternalComponentType = 'disputesManagement';

    constructor(props: _UIComponentProps<DisputesManagementProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <DisputeManagement {...this.props}></DisputeManagement>;
    };
}

export default DisputeManagementElement;

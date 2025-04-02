import DataOverviewDetails from '../../internal/DataOverviewDetails/DataOverviewDetails';
import { _UIComponentProps, ExternalComponentType } from '../../types';
import UIElement from '../UIElement/UIElement';
import { DisputesManagementProps } from './types';

export class DisputeManagementElement extends UIElement<DisputesManagementProps> {
    public static type: ExternalComponentType = 'disputesManagement';

    constructor(props: _UIComponentProps<DisputesManagementProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <DataOverviewDetails {...this.props} type={'dispute'} />;
    };
}

export default DisputeManagementElement;

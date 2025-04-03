import DataOverviewDetails from '../../internal/DataOverviewDetails/DataOverviewDetails';
import { _UIComponentProps, ExternalComponentType } from '../../types';
import UIElement from '../UIElement/UIElement';
import { DisputeDetailsProps } from './types';

export class DisputeManagementElement extends UIElement<DisputeDetailsProps> {
    public static type: ExternalComponentType = 'disputesManagement';

    constructor(props: _UIComponentProps<DisputeDetailsProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <DataOverviewDetails {...this.props} type={'dispute'} />;
    };
}

export default DisputeManagementElement;

import { _UIComponentProps } from '../../types';
import UIElement from '../UIElement/UIElement';
import DataOverviewDetails from '../../internal/DataOverviewDetails/DataOverviewDetails';
import { DetailsComponentProps } from './types';

export class TransactionElement extends UIElement<DetailsComponentProps> {
    public static type = 'transactionDetails';

    constructor(props: _UIComponentProps<DetailsComponentProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return (
            <DataOverviewDetails
                {...this.props}
                type={'transaction'}
                ref={(ref: UIElement<DetailsComponentProps>) => void (this.componentRef = ref)}
            />
        );
    };
}

export default TransactionElement;

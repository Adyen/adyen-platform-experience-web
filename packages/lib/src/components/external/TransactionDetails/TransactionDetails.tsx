import { _UIComponentProps } from '../../types';
import UIElement from '../UIElement';
import DataOverviewDetails from '../../internal/DataOverviewDetails/DataOverviewDetails';
import { DetailsComponentProps } from './types';

export class TransactionsElement extends UIElement<DetailsComponentProps> {
    public static type = 'transactionsDetails';

    constructor(props: _UIComponentProps<DetailsComponentProps>) {
        super(props);
        this.elementRef = (props && props.elementRef) || this;
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <DataOverviewDetails {...this.props} type={'transaction'} />;
    };
}

export default TransactionsElement;

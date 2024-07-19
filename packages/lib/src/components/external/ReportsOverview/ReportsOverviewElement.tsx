import { _UIComponentProps, ReportsOverviewComponentProps, TransactionOverviewComponentProps } from '../../types';
import Reports from './components/ReportsOverviewContainer/ReportsOverviewContainer';
import UIElement from '../UIElement/UIElement';

export class ReportsElement extends UIElement<ReportsOverviewComponentProps> {
    public static type = 'reports';

    constructor(props: _UIComponentProps<ReportsOverviewComponentProps>) {
        super(props);
        this.elementRef = (props && props.elementRef) || this;
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return (
            <Reports
                {...this.props}
                balanceAccountId={this.props.core.options.balanceAccountId}
                ref={(ref: UIElement<TransactionOverviewComponentProps>) => {
                    this.componentRef = ref;
                }}
                elementRef={this.elementRef}
            ></Reports>
        );
    };
}

export default ReportsElement;

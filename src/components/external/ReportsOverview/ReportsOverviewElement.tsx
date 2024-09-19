import { _UIComponentProps, ReportsOverviewComponentProps } from '../../types';
import Reports from './components/ReportsOverviewContainer/ReportsOverviewContainer';
import UIElement from '../UIElement/UIElement';

export class ReportsElement extends UIElement<ReportsOverviewComponentProps> {
    public static type = 'reports';

    constructor(props: _UIComponentProps<ReportsOverviewComponentProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return (
            <Reports
                {...this.props}
                balanceAccountId={this.props.balanceAccountId}
                ref={(ref: UIElement<ReportsOverviewComponentProps>) => {
                    this.componentRef = ref;
                }}
            ></Reports>
        );
    };
}

export default ReportsElement;

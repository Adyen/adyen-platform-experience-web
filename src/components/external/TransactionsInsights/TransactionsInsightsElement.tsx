import { _UIComponentProps, ExternalComponentType, TransactionsInsightsComponentProps } from '../../types';
import TransactionsInsights from './components/TransactionsInsightsContainer/TransactionsInsightsContainer';
import UIElement from '../UIElement/UIElement';

export class TransactionsInsightsElement extends UIElement<TransactionsInsightsComponentProps> {
    public static type: ExternalComponentType = 'transactionsInsights';

    constructor(props: _UIComponentProps<TransactionsInsightsComponentProps>) {
        super(props);
    }

    public componentToRender = () => {
        return <TransactionsInsights {...this.props} />;
    };
}

export default TransactionsInsightsElement;

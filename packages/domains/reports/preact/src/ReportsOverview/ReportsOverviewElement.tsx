import type { ExternalComponentType, _UIComponentProps } from '@integration-components/types';
import type { ReportsOverviewComponentProps } from '@integration-components/reports/domain';
import { UIElement } from '@integration-components/core/preact';
import Reports from './components/ReportsOverviewContainer/ReportsOverviewContainer';

export class ReportsElement extends UIElement<ReportsOverviewComponentProps> {
    public static type: ExternalComponentType = 'reports';

    constructor(props: _UIComponentProps<ReportsOverviewComponentProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <Reports {...this.props} />;
    };
}

export default ReportsElement;

import type { CoreInstance } from '@integration-components/core/vue';
import type { ReportsOverviewDomainProps } from '@integration-components/reports/vue/definitions';
import type { ExternalComponentType } from '@integration-components/types';
import { DomainComponent } from '../internal/DomainComponent';
import { bindReportsOverview } from './bindReportsOverview';

export interface ReportsOverviewExternalProps extends ReportsOverviewDomainProps {
    core: CoreInstance;
}

export class ReportsOverviewElement extends DomainComponent<ReportsOverviewDomainProps> {
    public static readonly type: ExternalComponentType = 'reports';

    constructor({ core, ...props }: ReportsOverviewExternalProps) {
        const integration = bindReportsOverview(core);
        super(core, props, ReportsOverviewElement.type, 'Reports overview', nextProps => integration.create(nextProps));
    }
}

export default ReportsOverviewElement;

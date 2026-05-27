import { UIElement } from '@integration-components/core/vue';
import ReportsOverviewContainer from './components/ReportsOverviewContainer.vue';
import type { ReportsOverviewExternalProps } from './types';

/**
 * Imperative wrapper for ReportsOverview, mirroring the Preact BaseElement.mount() pattern.
 *
 * Usage:
 *   const core = await new Core({ ... }).initialize();
 *   const reportsOverview = new ReportsOverviewElement({ core, balanceAccountId: 'BA...' });
 *   reportsOverview.mount('#reports-container');
 *   reportsOverview.update({ balanceAccountId: 'BA_NEW...' });
 *   reportsOverview.unmount();
 */
export class ReportsOverviewElement extends UIElement<ReportsOverviewExternalProps> {
    constructor(props: ReportsOverviewExternalProps) {
        super(ReportsOverviewContainer, props, 'ReportsOverview');
    }
}

export default ReportsOverviewElement;

import { UIElement } from '../UIElement';
import ReportsOverviewWrapper from './ReportsOverviewWrapper.vue';
import type { ReportsOverviewExternalProps } from './types';

/**
 * Imperative wrapper for ReportsOverview, mirroring the Preact BaseElement.mount() pattern.
 *
 * Usage:
 *   const core = await AdyenPlatformExperienceVue({ ... });
 *   const reportsOverview = new ReportsOverviewElement({ core, balanceAccountId: 'BA...' });
 *   reportsOverview.mount('#reports-container');
 *   reportsOverview.update({ balanceAccountId: 'BA_NEW...' });
 *   reportsOverview.unmount();
 */
export class ReportsOverviewElement extends UIElement<ReportsOverviewExternalProps> {
    constructor(props: ReportsOverviewExternalProps) {
        super(ReportsOverviewWrapper, props);
    }
}

export default ReportsOverviewElement;

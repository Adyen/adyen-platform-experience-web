import type { App } from 'vue';
import BentoVue from '@adyen/bento-vue3';
import { UIElement } from '@integration-components/core/vue';
import ReportsOverviewContainer from './components/ReportsOverviewContainer.vue';
import type { ExternalComponentType } from '@integration-components/types';
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
    public static readonly type: ExternalComponentType = 'reports' as const;

    constructor(props: ReportsOverviewExternalProps) {
        super(ReportsOverviewContainer, props, 'reports');
    }

    protected configureApp(app: App): void {
        app.use(BentoVue, { withToast: true, withDesignTokensCSSInjection: false });
    }
}

export default ReportsOverviewElement;

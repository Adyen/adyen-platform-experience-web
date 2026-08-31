import { createDomainVueInstance } from '@integration-components/composables-vue/createDomainVueInstance';
import type { DomainComponentInstance } from '@integration-components/domain-integration';
import ReportsOverview from '../ReportsOverview/components/ReportsOverview.vue';
import { createReportsVuePlugin } from './createReportsVuePlugin';
import type { ReportsOverviewDependencies, ReportsOverviewDomainProps } from './types';

export const createReportsOverview = (
    props: ReportsOverviewDomainProps,
    dependencies: ReportsOverviewDependencies
): DomainComponentInstance<Partial<ReportsOverviewDomainProps>, Element | string> =>
    createDomainVueInstance({
        component: ReportsOverview,
        createPlugin: () => createReportsVuePlugin(dependencies),
        name: 'Reports overview',
        props,
    });

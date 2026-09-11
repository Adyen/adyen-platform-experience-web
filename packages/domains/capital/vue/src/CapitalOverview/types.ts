import type { CoreInstance } from '@integration-components/core/vue';
import { UIElementProps } from '@integration-components/types';

export type CapitalOverviewComponentProps = UIElementProps;

export interface CapitalOverviewExternalProps extends CapitalOverviewComponentProps {
    core: CoreInstance;
}

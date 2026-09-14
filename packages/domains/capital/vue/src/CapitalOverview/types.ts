import type { CoreInstance } from '@integration-components/core/vue';
import { UIElementProps } from '@integration-components/types';

export type CapitalOverviewExternalProps = Omit<UIElementProps, 'ref'> & {
    core: CoreInstance;
};

export type CapitalOverviewProps = Omit<CapitalOverviewExternalProps, 'core'>;

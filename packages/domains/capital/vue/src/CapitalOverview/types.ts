import type { UIElementProps } from '@integration-components/core/vue';

export type CapitalOverviewExternalProps = UIElementProps;
export type CapitalOverviewComponentProps = Omit<CapitalOverviewExternalProps, 'core' | 'appearance'>;

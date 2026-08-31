import { inject, ref } from 'vue';
import { COMPONENT_REF_KEY } from '@integration-components/core/vue/Context/constants';
import { containerQueries, type ResponsiveViewportContainerQuery } from './containerQueries';
import { useContainerQuery } from './useContainerQuery';

export { containerQueries };
export type { ResponsiveViewportContainerQuery };

export const useResponsiveContainer = (query: ResponsiveViewportContainerQuery) =>
    useContainerQuery(query, inject(COMPONENT_REF_KEY, ref<HTMLElement | null>(null)));

export default useResponsiveContainer;

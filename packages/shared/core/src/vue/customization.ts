import { computed } from 'vue';
import type { GlobalAppearance, WithDataGridAppearance } from '@integration-components/types';
import { useCoreContext } from './Context';

type ComponentAppearance = GlobalAppearance & WithDataGridAppearance;

export const resolveAppearance = (
    globalAppearance: GlobalAppearance | undefined,
    componentAppearance: ComponentAppearance | undefined
): ComponentAppearance | undefined => {
    const illustrations = componentAppearance?.illustrations ?? globalAppearance?.illustrations;
    const titles = componentAppearance?.titles ?? globalAppearance?.titles;
    const dataGrid = componentAppearance?.dataGrid?.density ? componentAppearance.dataGrid : undefined;

    return illustrations || titles || dataGrid
        ? {
              ...(illustrations && { illustrations }),
              ...(titles && { titles }),
              ...(dataGrid && { dataGrid }),
          }
        : undefined;
};

export const useShouldHideIllustrations = () => {
    const coreContext = useCoreContext();
    return computed(() => coreContext.appearance?.illustrations === 'hidden');
};

export const useShouldHideTitles = () => {
    const coreContext = useCoreContext();
    return computed(() => coreContext.appearance?.titles === 'hidden');
};

export const useCondensedDataGrid = () => {
    const coreContext = useCoreContext();
    return computed(() => coreContext.appearance?.dataGrid?.density === 'condensed');
};

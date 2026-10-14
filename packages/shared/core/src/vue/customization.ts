import { computed } from 'vue';
import type { GlobalAppearance, WithDataGridAppearance } from '@integration-components/types';
import { useCoreContext } from './Context';

export const hasDataGridAppearance = <TAppearance extends GlobalAppearance>(
    appearance: TAppearance | undefined
): appearance is TAppearance & WithDataGridAppearance => !!appearance && 'dataGrid' in appearance;

export const resolveAppearance = <TComponentAppearance extends GlobalAppearance = GlobalAppearance>(
    globalAppearance: GlobalAppearance | undefined,
    componentAppearance: TComponentAppearance | undefined
): GlobalAppearance | undefined => {
    const illustrations = componentAppearance?.illustrations ?? globalAppearance?.illustrations;
    const titles = componentAppearance?.titles ?? globalAppearance?.titles;
    const dataGrid = hasDataGridAppearance(componentAppearance) && componentAppearance.dataGrid?.density ? componentAppearance.dataGrid : undefined;

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
    return computed(() => {
        const appearance = coreContext.appearance;
        return hasDataGridAppearance(appearance) && appearance.dataGrid?.density === 'condensed';
    });
};

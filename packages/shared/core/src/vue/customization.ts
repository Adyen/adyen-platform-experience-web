import type { Appearance } from '@integration-components/types';

export const resolveAppearance = (globalAppearance: Appearance | undefined, componentAppearance: Appearance | undefined): Appearance | undefined => {
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

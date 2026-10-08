import type { GlobalAppearance, WithDataGridAppearance } from '@integration-components/types';

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

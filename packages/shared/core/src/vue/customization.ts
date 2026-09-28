import type { Appearance } from '@integration-components/types';

export const resolveAppearance = (globalAppearance: Appearance | undefined, componentAppearance: Appearance | undefined): Appearance | undefined => {
    const illustrations = componentAppearance?.illustrations ?? globalAppearance?.illustrations;
    const titles = componentAppearance?.titles ?? globalAppearance?.titles;
    const density = componentAppearance?.density && Object.keys(componentAppearance.density).length > 0 ? componentAppearance.density : undefined;

    return illustrations || titles || density
        ? {
              ...(illustrations && { illustrations }),
              ...(titles && { titles }),
              ...(density && { density }),
          }
        : undefined;
};

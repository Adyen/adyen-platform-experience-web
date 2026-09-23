import type { Appearance } from '@integration-components/types';

export const resolveAppearance = (globalAppearance: Appearance | undefined, componentAppearance: Appearance | undefined): Appearance | undefined => {
    const illustrations = componentAppearance?.illustrations ?? globalAppearance?.illustrations;
    const titles = componentAppearance?.titles ?? globalAppearance?.titles;
    const density = componentAppearance?.density;

    const resolvedDensity = density && typeof density === 'object' && Object.keys(density).length > 0 ? density : undefined;

    return illustrations || titles || resolvedDensity
        ? {
              ...(illustrations && { illustrations }),
              ...(titles && { titles }),
              ...(resolvedDensity && { density: resolvedDensity }),
          }
        : undefined;
};

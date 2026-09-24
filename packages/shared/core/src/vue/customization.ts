import type { Appearance } from '@integration-components/types';

export const resolveAppearance = (globalAppearance: Appearance | undefined, componentAppearance: Appearance | undefined): Appearance | undefined => {
    const illustrations = componentAppearance?.illustrations ?? globalAppearance?.illustrations;
    const titles = componentAppearance?.titles ?? globalAppearance?.titles;

    return illustrations || titles
        ? {
              ...(illustrations && { illustrations }),
              ...(titles && { titles }),
          }
        : undefined;
};

import type { Appearance } from '@integration-components/types';

export const resolveAppearance = (globalAppearance: Appearance | undefined, componentAppearance: Appearance | undefined): Appearance | undefined => {
    const container = componentAppearance?.container ?? globalAppearance?.container;
    const illustrations = componentAppearance?.illustrations ?? globalAppearance?.illustrations;
    const titles = componentAppearance?.titles ?? globalAppearance?.titles;

    return container || illustrations || titles
        ? {
              ...(container && { container }),
              ...(illustrations && { illustrations }),
              ...(titles && { titles }),
          }
        : undefined;
};

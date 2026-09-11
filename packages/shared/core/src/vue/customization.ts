import type { Appearance } from '@integration-components/types';

export const resolveAppearance = (
    experienceAppearance: Appearance | undefined,
    componentAppearance: Appearance | undefined
): Appearance | undefined => {
    const illustrations = componentAppearance?.illustrations ?? experienceAppearance?.illustrations;
    const titles = componentAppearance?.titles ?? experienceAppearance?.titles;

    return illustrations || titles
        ? {
              ...(illustrations && { illustrations }),
              ...(titles && { titles }),
          }
        : undefined;
};

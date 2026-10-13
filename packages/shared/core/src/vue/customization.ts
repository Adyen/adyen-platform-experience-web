import { computed } from 'vue';
import type { Appearance } from '@integration-components/types';
import { useCoreContext } from './Context';

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

export const useShouldHideIllustrations = () => {
    const coreContext = useCoreContext();
    return computed(() => coreContext.appearance?.illustrations === 'hidden');
};

export const useShouldHideTitles = () => {
    const coreContext = useCoreContext();
    return computed(() => coreContext.appearance?.titles === 'hidden');
};

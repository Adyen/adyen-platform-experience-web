import { computed, type ComputedRef } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import type { DensityMode } from '@integration-components/types';

export const useShouldHideIllustrations = () => {
    let coreContext: ReturnType<typeof useCoreContext> | undefined;
    try {
        coreContext = useCoreContext();
    } catch {
        // Fallback for isolated unit tests
    }

    return computed(() => coreContext?.appearance?.illustrations === 'hidden');
};

export const useShouldHideTitles = () => {
    let coreContext: ReturnType<typeof useCoreContext> | undefined;
    try {
        coreContext = useCoreContext();
    } catch {
        // Fallback for isolated unit tests
    }

    return computed(() => coreContext?.appearance?.titles === 'hidden');
};

export const useDensity = (target: string): ComputedRef<DensityMode> => {
    let coreContext: ReturnType<typeof useCoreContext> | undefined;
    try {
        coreContext = useCoreContext();
    } catch {
        // Fallback for isolated unit tests
    }

    return computed<DensityMode>(() => {
        const density = coreContext?.appearance?.density;
        return density?.[target] ?? 'default';
    });
};

export const useCondensed = (target: string): ComputedRef<boolean> => {
    const density = useDensity(target);
    return computed(() => density.value === 'condensed');
};

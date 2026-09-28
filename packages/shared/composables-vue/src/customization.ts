import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';

export const useShouldHideIllustrations = () => {
    const coreContext = useCoreContext();

    return computed(() => coreContext.appearance?.illustrations === 'hidden');
};

export const useShouldHideTitles = () => {
    const coreContext = useCoreContext();

    return computed(() => coreContext.appearance?.titles === 'hidden');
};

export const useCondensed = (target: 'dataGrid') => {
    const coreContext = useCoreContext();

    return computed(() => coreContext.appearance?.density?.[target] === 'condensed');
};

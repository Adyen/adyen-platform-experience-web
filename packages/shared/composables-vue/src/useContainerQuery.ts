import { ref, computed, watch, onUnmounted, inject } from 'vue';
import { COMPONENT_REF_KEY } from '@integration-components/core/vue/Context/constants';

type ContainerQuery = readonly [string, number, { min?: number; max?: number }?];

export const useContainerQuery = <T extends ContainerQuery>(query: T) => {
    const containerRef = inject(COMPONENT_REF_KEY, ref<HTMLElement | null>(null));
    const width = ref(0);
    const [type, breakpoint, minMax] = query;

    const matches = computed(() => {
        switch (type) {
            case 'up':
                return width.value >= breakpoint;
            case 'down':
                return width.value <= breakpoint;
            case 'only':
                if (minMax) {
                    const { min, max } = minMax;
                    return max ? width.value <= max : min ? width.value >= min : false;
                }
                return width.value === breakpoint;
            default:
                return false;
        }
    });

    let resizeObserver: ResizeObserver | null = null;

    function cleanup() {
        resizeObserver?.disconnect();
        resizeObserver = null;
    }

    watch(
        containerRef,
        el => {
            cleanup();
            if (!el) return;

            width.value = el.offsetWidth;

            resizeObserver = new ResizeObserver(entries => {
                for (const entry of entries) {
                    if (entry.target === el) {
                        width.value = el.offsetWidth;
                    }
                }
            });

            resizeObserver.observe(el);
        },
        { immediate: true }
    );

    onUnmounted(cleanup);

    return matches;
};

export default useContainerQuery;

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
                    return max !== undefined ? width.value <= max : min !== undefined ? width.value >= min : false;
                }
                return width.value === breakpoint;
            default:
                return false;
        }
    });

    let resizeObserver: ResizeObserver | null = null;
    let frameId: number | null = null;

    function cleanup() {
        if (frameId !== null) {
            cancelAnimationFrame(frameId);
            frameId = null;
        }
        resizeObserver?.disconnect();
        resizeObserver = null;
    }

    function updateWidth(el: HTMLElement) {
        const next = el.offsetWidth;
        if (next !== width.value) width.value = next;
    }

    watch(
        containerRef,
        el => {
            cleanup();
            if (!el) return;

            updateWidth(el);

            resizeObserver = new ResizeObserver(entries => {
                for (const entry of entries) {
                    if (entry.target !== el) continue;
                    if (frameId !== null) cancelAnimationFrame(frameId);
                    frameId = requestAnimationFrame(() => {
                        frameId = null;
                        updateWidth(el);
                    });
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

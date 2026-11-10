import { ref, readonly, watch, onUnmounted, inject } from 'vue';
import { COMPONENT_REF_KEY } from '@integration-components/core/vue/Context/constants';

type ContainerQuery = readonly [string, number, { min?: number; max?: number }?];

// How far (px) past a breakpoint the container must grow before the wider layout comes back.
// Switching layouts can change the page height and make a vertical scrollbar appear or disappear,
// which changes the container width. Near a breakpoint this can loop forever, e.g. at 491px the wider
// layout overflows, the scrollbar shrinks the container to 476px, the narrower layout fits, the scrollbar
// goes away, and the container is back at 491px. 24px covers classic scrollbars (15-17px) with headroom for browser zoom.
const SCROLLBAR_WIDTH_TOLERANCE = 24;

// Last resolved result of each query, per container element. Every component that calls this composable
// for the same container reads the same result. Without this, a component mounted inside the tolerance band
// would evaluate the raw width and could disagree with components that are already holding the narrower layout.
const resolvedQueriesByContainer = new WeakMap<HTMLElement, Map<string, boolean>>();

const matchesWidth = ([type, breakpoint, minMax]: ContainerQuery, width: number) => {
    switch (type) {
        case 'up':
            return width >= breakpoint;
        case 'down':
            return width <= breakpoint;
        case 'only':
            if (!minMax) return width === breakpoint;
            return (minMax.min === undefined || width >= minMax.min) && (minMax.max === undefined || width <= minMax.max);
        default:
            return false;
    }
};

const resolveMatches = (el: HTMLElement, query: ContainerQuery, queryKey: string) => {
    const width = el.offsetWidth;
    const resolvedQueries = resolvedQueriesByContainer.get(el) ?? new Map<string, boolean>();
    const previous = resolvedQueries.get(queryKey);
    // A width of 0 means the container is hidden (e.g. display: none). Keep the last result, so the layout doesn't
    // switch while hidden and flash when shown again. The stored result is left untouched so that every query of
    // this container keeps agreeing, and the next real measurement updates it.
    if (width === 0) return previous ?? matchesWidth(query, width);

    const next = matchesWidth(query, width);
    // Accept the new result only if it would also hold for a container SCROLLBAR_WIDTH_TOLERANCE px narrower.
    // Shrinking past a breakpoint therefore switches to the narrower layout immediately, but growing back only
    // switches once the container is more than the tolerance past the breakpoint, so a scrollbar can't undo it.
    // With no previous result (first measurement), the raw width is used as is.
    const matches = previous === undefined || matchesWidth(query, width - SCROLLBAR_WIDTH_TOLERANCE) === next ? next : previous;

    resolvedQueries.set(queryKey, matches);
    resolvedQueriesByContainer.set(el, resolvedQueries);

    return matches;
};

export const useContainerQuery = <T extends ContainerQuery>(query: T) => {
    const containerRef = inject(COMPONENT_REF_KEY, ref<HTMLElement | null>(null));
    const queryKey = JSON.stringify(query);
    const matches = ref(matchesWidth(query, 0));

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

    function updateMatches(el: HTMLElement) {
        matches.value = resolveMatches(el, query, queryKey);
    }

    watch(
        containerRef,
        el => {
            cleanup();
            if (!el) return;

            updateMatches(el);

            resizeObserver = new ResizeObserver(entries => {
                for (const entry of entries) {
                    if (entry.target !== el) continue;
                    if (frameId !== null) cancelAnimationFrame(frameId);
                    frameId = requestAnimationFrame(() => {
                        frameId = null;
                        updateMatches(el);
                    });
                }
            });

            resizeObserver.observe(el);
        },
        { immediate: true }
    );

    onUnmounted(cleanup);

    return readonly(matches);
};

export default useContainerQuery;

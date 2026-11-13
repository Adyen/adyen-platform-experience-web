import { onUnmounted, ref, watch, type Ref } from 'vue';

export const CUSTOM_FIELD_ATTRIBUTE = 'data-custom-field';

const GRID_CELL_SELECTOR = '.b-data-grid-cell';

const MEASUREMENT_CLONE_STYLE =
    ';position:absolute;visibility:hidden;pointer-events:none;width:max-content;min-width:0;max-width:none;white-space:nowrap';

const getWidth = (element: Element | null | undefined) => element?.getBoundingClientRect().width ?? 0;

const getHorizontalInset = (element: Element) => {
    const { paddingLeft, paddingRight, borderLeftWidth, borderRightWidth } = getComputedStyle(element);
    return [paddingLeft, paddingRight, borderLeftWidth, borderRightWidth].reduce((inset, value) => inset + (Number.parseFloat(value) || 0), 0);
};

const createWidths = (): Record<string, number> => Object.create(null);

const isSameWidths = (current: Record<string, number>, next: Record<string, number>) => {
    const keys = Object.keys(next);
    return keys.length === Object.keys(current).length && keys.every(key => current[key] === next[key]);
};

/**
 * Measures the rendered content of custom data cells (marked with `data-custom-field`) so that
 * custom columns can be sized to fit their full content, since the data grid cannot infer the
 * width of slotted content such as links with icons, buttons or flags.
 */
export function useCustomColumnWidths(
    root: Ref<HTMLElement | null | undefined>,
    source: () => unknown,
    columns: () => ReadonlyArray<{ field: string; visible?: boolean }>
) {
    const widths = ref<Record<string, number>>(createWidths());
    const observed = new Set<Element>();
    const observedWidths = new WeakMap<Element, number>();
    let skippedWhileHidden = false;
    let frameId: number | null = null;
    let active = true;

    const observer =
        typeof ResizeObserver === 'undefined'
            ? undefined
            : new ResizeObserver(entries => {
                  const shouldMeasure = entries.some(({ target }) =>
                      target === root.value ? skippedWhileHidden && getWidth(target) > 0 : getWidth(target) !== observedWidths.get(target)
                  );
                  if (shouldMeasure) scheduleMeasure();
              });

    const syncObserved = (elements: Element[]) => {
        const current = new Set(elements);
        observed.forEach(element => {
            if (current.has(element)) return;
            observer?.unobserve(element);
            observed.delete(element);
        });
        current.forEach(element => {
            if (observed.has(element)) return;
            observer?.observe(element);
            observed.add(element);
        });
    };

    const measure = () => {
        frameId = null;
        const container = root.value;

        skippedWhileHidden = !container || getWidth(container) === 0;
        if (!container || skippedWhileHidden) {
            syncObserved(container ? [container] : []);
            return;
        }

        const next = createWidths();
        const setWidth = (key: string, width: number) => {
            next[key] = Math.max(next[key] ?? 0, Math.ceil(width));
        };

        const customElements = Array.from(container.querySelectorAll<HTMLElement>(`[${CUSTOM_FIELD_ATTRIBUTE}]`));
        for (const element of customElements) {
            const width = getWidth(element);
            observedWidths.set(element, width);
            const key = element.getAttribute(CUSTOM_FIELD_ATTRIBUTE);
            if (!key) continue;
            const cellInset = getWidth(element.closest(GRID_CELL_SELECTOR)) - getWidth(element.parentElement);
            setWidth(key, width + Math.max(cellInset, 0));
        }

        const fields = columns()
            .filter(column => column.visible !== false)
            .map(column => column.field);
        const standardCells = Array.from(container.querySelectorAll<HTMLElement>('[role="gridcell"], [role="columnheader"]')).flatMap(cell => {
            if (cell.querySelector(`[${CUSTOM_FIELD_ATTRIBUTE}]`)) return [];
            const key = fields[Number(cell.getAttribute('aria-colindex')) - 1];
            const content = cell.firstElementChild;
            if (!key || !(content instanceof HTMLElement)) return [];
            return [{ cell, key, inset: getHorizontalInset(cell), clone: content.cloneNode(true) as HTMLElement }];
        });

        for (const { cell, clone } of standardCells) {
            clone.style.cssText += MEASUREMENT_CLONE_STYLE;
            cell.append(clone);
        }
        for (const { key, inset, clone } of standardCells) setWidth(key, getWidth(clone) + inset);
        for (const { clone } of standardCells) clone.remove();

        syncObserved([...customElements, container]);
        if (!isSameWidths(widths.value, next)) widths.value = next;
    };

    function scheduleMeasure() {
        if (!active) return;
        if (frameId !== null) cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(measure);
    }

    watch([root, source], scheduleMeasure, { flush: 'post', immediate: true });

    if (typeof document !== 'undefined') void document.fonts?.ready.then(scheduleMeasure);

    onUnmounted(() => {
        active = false;
        if (frameId !== null) cancelAnimationFrame(frameId);
        observer?.disconnect();
    });

    return widths;
}

export default useCustomColumnWidths;

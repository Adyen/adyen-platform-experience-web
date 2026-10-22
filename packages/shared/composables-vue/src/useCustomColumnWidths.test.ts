/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, ref, type App } from 'vue';
import { CUSTOM_FIELD_ATTRIBUTE, useCustomColumnWidths } from './useCustomColumnWidths';

const withWidth = <T extends HTMLElement>(element: T, width: number) => {
    element.getBoundingClientRect = () => ({ width }) as DOMRect;
    return element;
};

const createRoot = (width = 800) => withWidth(document.createElement('div'), width);

const createCell = (key: string, contentWidth: number) => {
    const cell = withWidth(document.createElement('div'), 120);
    cell.className = 'b-data-grid-cell';
    const container = withWidth(document.createElement('div'), 88);
    const content = withWidth(document.createElement('a'), contentWidth);
    content.setAttribute(CUSTOM_FIELD_ATTRIBUTE, key);
    container.append(content);
    cell.append(container);
    return cell;
};

const createStandardCell = (
    key: string,
    width: number,
    { header = false, columnIndex = key === 'createdAt' ? 1 : 2, onMeasure }: { header?: boolean; columnIndex?: number; onMeasure?: () => void } = {}
) => {
    const cell = withWidth(document.createElement('div'), 120);
    cell.style.paddingLeft = '16px';
    cell.style.paddingRight = '16px';
    cell.setAttribute('role', header ? 'columnheader' : 'gridcell');
    cell.setAttribute('aria-colindex', String(columnIndex));
    const content = withWidth(document.createElement('div'), 88);
    content.textContent = key;
    vi.spyOn(content, 'cloneNode').mockImplementation(() => {
        const clone = document.createElement('div');
        clone.setAttribute('data-clone', '');
        clone.getBoundingClientRect = () => {
            onMeasure?.();
            return { width } as DOMRect;
        };
        return clone;
    });
    cell.append(content);
    return cell;
};

const resizeEntries = (...targets: Element[]) => targets.map(target => ({ target })) as unknown as ResizeObserverEntry[];

describe('useCustomColumnWidths', () => {
    let app: App | undefined;
    let target: HTMLDivElement | undefined;
    let resizeCallback: ResizeObserverCallback | undefined;
    const observe = vi.fn();
    const requestFrame = vi.fn((callback: FrameRequestCallback) => {
        callback(0);
        return 1;
    });

    const mount = (
        root: HTMLElement,
        source: () => unknown,
        columns: Parameters<typeof useCustomColumnWidths>[2] = () => [{ field: 'createdAt' }, { field: 'amount' }]
    ) => {
        let widths!: ReturnType<typeof useCustomColumnWidths>;
        app = createApp(
            defineComponent({
                setup() {
                    widths = useCustomColumnWidths(ref(root), source, columns);
                    return () => h('div');
                },
            })
        );
        target = document.createElement('div');
        app.mount(target);
        return widths;
    };

    const notifyResize = (...targets: Element[]) => resizeCallback?.(resizeEntries(...targets), {} as ResizeObserver);

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal(
            'ResizeObserver',
            vi.fn(function (callback: ResizeObserverCallback) {
                resizeCallback = callback;
                return { observe, unobserve: vi.fn(), disconnect: vi.fn() };
            })
        );
        vi.stubGlobal('requestAnimationFrame', requestFrame);
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
    });

    afterEach(() => {
        app?.unmount();
        target?.remove();
        vi.unstubAllGlobals();
    });

    test('measures the widest rendered content of each custom column, including the cell inset', async () => {
        const root = createRoot();
        root.append(createCell('reference', 167.2), createCell('reference', 100), createCell('store', 60));
        const data = ref(1);
        const widths = mount(root, () => data.value);
        await nextTick();

        expect(widths.value).toEqual({ reference: 200, store: 92 });

        root.replaceChildren(createCell('reference', 40));
        data.value++;
        await nextTick();
        await nextTick();

        expect(widths.value).toEqual({ reference: 72 });
    });

    test('measures standard slotted cells and headers at their intrinsic width, including cell insets', async () => {
        const root = createRoot();
        root.append(
            createStandardCell('createdAt', 167.2),
            createStandardCell('createdAt', 100),
            createStandardCell('amount', 60),
            createStandardCell('amount', 150, { header: true })
        );
        const data = ref(1);
        const widths = mount(root, () => data.value);
        await nextTick();

        expect(widths.value).toEqual({ createdAt: 200, amount: 182 });
        expect(root.querySelectorAll('[data-clone]')).toHaveLength(0);
        expect(root.querySelectorAll('[role="gridcell"]')).toHaveLength(3);
        expect(root.querySelectorAll('[role="columnheader"]')).toHaveLength(1);

        for (const cell of root.children) {
            withWidth(cell as HTMLElement, 400);
        }
        data.value++;
        await nextTick();
        await nextTick();

        expect(widths.value).toEqual({ createdAt: 200, amount: 182 });
    });

    test('maps accessible column indices to visible fields without test IDs', async () => {
        const root = createRoot();
        root.append(
            createStandardCell('createdAt', 100),
            createStandardCell('amount', 150, { header: true }),
            createStandardCell('unmapped', 500, { columnIndex: 3 }),
            createStandardCell('invalid', 500, { columnIndex: 0 })
        );
        const widths = mount(
            root,
            () => null,
            () => [{ field: 'hidden', visible: false }, { field: 'createdAt' }, { field: 'amount', visible: true }]
        );
        await nextTick();

        expect(root.querySelector('[data-testid]')).toBeNull();
        expect(widths.value).toEqual({ createdAt: 132, amount: 182 });
        expect(root.querySelectorAll('[data-clone]')).toHaveLength(0);
    });

    test('uses the current column order after the table data updates', async () => {
        const root = createRoot();
        root.append(createStandardCell('createdAt', 100));
        const data = ref(1);
        const columns = ref([{ field: 'createdAt' }, { field: 'amount' }]);
        const widths = mount(
            root,
            () => data.value,
            () => columns.value
        );
        await nextTick();

        expect(widths.value).toEqual({ createdAt: 132 });

        columns.value = [{ field: 'amount' }, { field: 'createdAt' }];
        root.replaceChildren(createStandardCell('amount', 150, { columnIndex: 1 }));
        data.value++;
        await nextTick();
        await nextTick();

        expect(widths.value).toEqual({ amount: 182 });
    });

    test('attaches every measurement clone before reading any width so layout is only computed once per pass', async () => {
        const root = createRoot();
        const attachedClonesPerRead: number[] = [];
        const onMeasure = () => attachedClonesPerRead.push(root.querySelectorAll('[data-clone]').length);
        root.append(
            createStandardCell('createdAt', 100, { onMeasure }),
            createStandardCell('amount', 60, { onMeasure }),
            createStandardCell('amount', 80, { header: true, onMeasure })
        );
        mount(root, () => null);
        await nextTick();

        expect(attachedClonesPerRead).toEqual([3, 3, 3]);
        expect(root.querySelectorAll('[data-clone]')).toHaveLength(0);
    });

    test('measures prototype-named custom fields as plain own keys', async () => {
        const root = createRoot();
        root.append(createCell('constructor', 50), createCell('__proto__', 60), createCell('toString', 70));
        const widths = mount(root, () => null);
        await nextTick();

        expect(Object.entries(widths.value)).toEqual([
            ['constructor', 82],
            ['__proto__', 92],
            ['toString', 102],
        ]);
    });

    test('re-measures when custom cell content resizes after rendering, such as when an image loads', async () => {
        const cell = createCell('store', 75);
        const content = cell.querySelector<HTMLElement>(`[${CUSTOM_FIELD_ATTRIBUTE}]`)!;
        const root = createRoot();
        root.append(cell);
        const widths = mount(root, () => null);
        await nextTick();

        expect(widths.value).toEqual({ store: 107 });
        expect(observe).toHaveBeenCalledWith(content);

        withWidth(content, 107.1);
        notifyResize(content);

        expect(widths.value).toEqual({ store: 140 });
    });

    test('does not re-measure when the visible table or its observed content resize without changing content size', async () => {
        const cell = createCell('store', 75);
        const content = cell.querySelector<HTMLElement>(`[${CUSTOM_FIELD_ATTRIBUTE}]`)!;
        const root = createRoot();
        root.append(cell, createStandardCell('createdAt', 100));
        mount(root, () => null);
        await nextTick();

        const measures = requestFrame.mock.calls.length;
        expect(observe).not.toHaveBeenCalledWith(root.querySelector('[role="gridcell"] > div'));

        withWidth(root, 1600);
        notifyResize(root, content);

        expect(requestFrame).toHaveBeenCalledTimes(measures);
    });

    test('skips measuring while the table is hidden, keeps the last widths, and measures once it becomes visible', async () => {
        const root = createRoot(0);
        root.append(createCell('reference', 100));
        const data = ref(1);
        const widths = mount(root, () => data.value);
        await nextTick();

        expect(widths.value).toEqual({});
        expect(observe).toHaveBeenCalledWith(root);

        withWidth(root, 800);
        notifyResize(root);

        expect(widths.value).toEqual({ reference: 132 });

        withWidth(root, 0);
        data.value++;
        await nextTick();
        await nextTick();

        expect(widths.value).toEqual({ reference: 132 });
    });
});

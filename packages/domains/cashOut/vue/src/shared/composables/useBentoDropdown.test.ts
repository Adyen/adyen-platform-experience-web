/**
 * @vitest-environment jsdom
 */
import { effectScope, nextTick, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useBentoDropdown } from './useBentoDropdown';

// Like Bento's dropdown: its combobox tells whether the list is open, and while it is searched it is an input instead.
const comboboxOf = ({ searching = false, expanded = false, value = '' } = {}) => {
    const combobox = document.createElement(searching ? 'input' : 'div');
    combobox.setAttribute('role', 'combobox');
    combobox.setAttribute('aria-expanded', String(expanded));
    if (combobox instanceof HTMLInputElement) combobox.value = value;
    return combobox;
};

// The attributes and children are observed, which reports a change after the current task.
const settle = async () => {
    await nextTick();
    await new Promise(resolve => setTimeout(resolve));
};

describe('useBentoDropdown', () => {
    let resizeCallbacks: ResizeObserverCallback[];
    let width: number;

    beforeEach(() => {
        resizeCallbacks = [];
        width = 154;
        vi.stubGlobal(
            'ResizeObserver',
            vi.fn(function (callback: ResizeObserverCallback) {
                resizeCallbacks.push(callback);
                return { observe: vi.fn(), disconnect: vi.fn() };
            })
        );
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
            callback(0);
            return 0;
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    const renderDropdown = async () => {
        const element = document.createElement('div');
        element.getBoundingClientRect = () => ({ width }) as DOMRect;
        element.append(comboboxOf());
        const onClose = vi.fn();
        const root = ref<HTMLElement>();
        const scope = effectScope();
        const dropdown = scope.run(() => useBentoDropdown(root, { onClose }))!;
        // Like a component, whose element is there once it is mounted
        root.value = element;
        await nextTick();

        const show = async (combobox: HTMLElement) => {
            element.replaceChildren(combobox);
            await settle();
        };
        const resize = (newWidth: number) => {
            width = newWidth;
            resizeCallbacks.forEach(callback => callback([], {} as ResizeObserver));
        };
        return { dropdown, element, onClose, resize, show, stop: () => scope.stop() };
    };

    test('should tell when the list closes, also when it was searched in another combobox', async () => {
        const { onClose, show, stop } = await renderDropdown();

        await show(comboboxOf({ expanded: true }));
        await show(comboboxOf());
        expect(onClose).toHaveBeenCalledOnce();

        await show(comboboxOf({ searching: true, expanded: true }));
        expect(onClose).toHaveBeenCalledOnce();
        await show(comboboxOf({ searching: true }));
        expect(onClose).toHaveBeenCalledTimes(2);

        stop();
    });

    test('should keep the width it has with the selected option while it is searched, also once the list closes', async () => {
        const { element, resize, show, stop } = await renderDropdown();
        resize(180);

        await show(comboboxOf({ searching: true, expanded: true }));
        // Searched, it is as wide as what is typed, which doesn't count as its width with the selected option
        resize(60);
        expect(element.style.minWidth).toBe('180px');

        await show(comboboxOf({ searching: true }));
        expect(element.style.minWidth).toBe('180px');

        await show(comboboxOf());
        expect(element.style.minWidth).toBe('');

        stop();
    });

    test('should show the selected option from the start, all of it still selected, once it is selected while searched', async () => {
        const { dropdown, show, stop } = await renderDropdown();
        const input = comboboxOf({ searching: true, value: 'S. Hopper - Payroll' }) as HTMLInputElement;
        await show(input);
        input.select();
        input.scrollLeft = 21;

        await dropdown.showSelectedFromStart();

        expect([input.selectionStart, input.selectionEnd, input.selectionDirection, input.scrollLeft]).toEqual([0, 19, 'backward', 0]);

        stop();
    });

    test('should leave a combobox that is not searched as it is', async () => {
        const { dropdown, element, stop } = await renderDropdown();

        await expect(dropdown.showSelectedFromStart()).resolves.toBeUndefined();
        expect(element.querySelector('[role="combobox"]')?.tagName).toBe('DIV');

        stop();
    });

    test('should stop observing once its scope stops', async () => {
        const { onClose, show, stop } = await renderDropdown();
        await show(comboboxOf({ expanded: true }));

        stop();
        await show(comboboxOf());

        expect(onClose).not.toHaveBeenCalled();
    });
});

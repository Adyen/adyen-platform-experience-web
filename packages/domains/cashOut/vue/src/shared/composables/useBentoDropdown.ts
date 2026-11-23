import { nextTick, watch, type Ref } from 'vue';

const COMBOBOX_SELECTOR = '[role="combobox"]';

/**
 * Makes up for what Bento's dropdown in `root` lacks, so it can go once Bento has it:
 *
 * - It tells when its list opens but not when it closes, so `onClose` comes from its combobox, whose aria-expanded tells whether the
 *   list is open. When it can be searched, its combobox is another element while the list is open, an input to type the search into,
 *   so the whole dropdown is observed and the combobox is the one it has at the time.
 * - That input shows what is typed instead of the selected option, also once one is selected with Enter, until the dropdown loses
 *   the focus. So while it is there, the dropdown, as wide as what it shows, keeps the width it has with the selected option.
 * - Once an option is selected while searched, the input shows its label, all of it selected so typing searches again, but scrolled
 *   to its end. `showSelectedFromStart` shows it from the start, still all selected, once Bento has shown it.
 */
export const useBentoDropdown = (root: Ref<HTMLElement | undefined>, { onClose }: { onClose?: () => void } = {}) => {
    watch(
        root,
        (element, _, onCleanup) => {
            if (!element) return;

            const combobox = () => element.querySelector(COMBOBOX_SELECTOR);
            const isComboboxExpanded = () => combobox()?.getAttribute('aria-expanded') === 'true';
            const isSearching = () => combobox() instanceof HTMLInputElement;
            let isOpen = isComboboxExpanded();
            let selectionWidth = element.getBoundingClientRect().width;

            const resizeObserver =
                typeof ResizeObserver === 'undefined'
                    ? undefined
                    : new ResizeObserver(() => {
                          if (!isSearching()) selectionWidth = element.getBoundingClientRect().width;
                      });
            resizeObserver?.observe(element);

            const observer = new MutationObserver(() => {
                element.style.minWidth = isSearching() && selectionWidth ? `${selectionWidth}px` : '';

                const wasOpen = isOpen;
                isOpen = isComboboxExpanded();
                if (wasOpen && !isOpen) onClose?.();
            });
            observer.observe(element, { attributes: true, attributeFilter: ['aria-expanded'], childList: true, subtree: true });

            onCleanup(() => {
                observer.disconnect();
                resizeObserver?.disconnect();
            });
        },
        { flush: 'post' }
    );

    const showSelectedFromStart = async () => {
        await nextTick();
        requestAnimationFrame(() => {
            const input = root.value?.querySelector(COMBOBOX_SELECTOR);
            if (!(input instanceof HTMLInputElement)) return;
            input.setSelectionRange(0, input.value.length, 'backward');
            input.scrollLeft = 0;
        });
    };

    return { showSelectedFromStart } as const;
};

import elementWithFocus from './element';
import { InteractionKeyCode } from '../../../components/types';
import { unsignedModulo } from '../../../utils/compute';

export interface TabbableRoot {
    activate: () => void;
    active: boolean;
    current: Element | null;
    handleTab: (evt: KeyboardEvent) => boolean;
    next: () => Element | null;
    prev: () => Element | null;
    tabbables: Element[];
}

export const SELECTORS = `
    a[href],
    audio[controls],
    video[controls],
    button,
    input,
    select,
    textarea,
    [contenteditable],
    [tabindex]
`.replace(/\s+/, '');

export const ATTRIBUTES = ['contenteditable', 'controls', 'disabled', 'hidden', 'href', 'inert', 'tabindex'];
const checkedRadios = new Map<HTMLFormElement, Map<string, HTMLInputElement | null>>();

export const hasFocusWithin = (element: Element) => {
    let parent = elementWithFocus()?.parentNode as Element | null;
    while (parent) {
        if (parent === element) return true;
        parent = parent?.parentNode as Element | null;
    }
    return false;
};

export const isInput = (element: Element): element is HTMLInputElement => element.tagName === 'INPUT';
export const isRadio = (element: Element): element is HTMLInputElement => isInput(element) && element.type === 'radio';

export const isCheckedRadio = (element: Element): element is HTMLInputElement => {
    const name = (element as HTMLInputElement).name;
    const form = (element as HTMLInputElement).form;
    const checkedRadiosForForm = checkedRadios.get(form as HTMLFormElement);

    let checkedRadio = checkedRadiosForForm?.get(name);

    if (checkedRadio === undefined && form) {
        checkedRadio = (form.querySelector('input[type=radio][name=' + name + ']:checked') as HTMLInputElement) || null;
        checkedRadios.set(form, (checkedRadiosForForm || new Map<string, HTMLInputElement | null>()).set(name, checkedRadio));
    }

    return checkedRadio === element;
};

export const isTabbable = (element: Element) =>
    !(
        // [TODO]: Include all of these checks
        // (1) is not tabbable radio button
        // (2) has negative tabindex
        // (3) is disabled element
        // (4) is inert or inert subtree child
        // (5) is hidden input
        // (6) with visibility: hidden
        // (7) is summary of open details element
        // (8) is details with summary element
        // (9) is disabled fieldset subtree child

        /* (1) */ (
            (isRadio(element) && !isCheckedRadio(element)) ||
            /* (2) */ (element as HTMLElement)?.tabIndex < 0 ||
            /* (3) */ (element as HTMLInputElement)?.disabled ||
            /* (4) */ /^(true)?$/.test(element.getAttribute('inert') as string) ||
            /* (5) */ (isInput(element) && element.hidden)
        )
    );

export const createTabbableRoot = (rootElement: Element, deferredActivation = false) => {
    const tabbables: Element[] = [];

    let active = false;
    let currentTabbableIndex = -1;
    let observer: MutationObserver;

    const activate = () => {
        if (!active && (active = true)) {
            observer =
                observer ||
                new MutationObserver(records => {
                    if (shouldRefresh(records)) getTabbables();
                });

            observer.observe(rootElement, {
                attributeFilter: ATTRIBUTES,
                attributes: true,
                childList: true,
                subtree: true,
            });

            getTabbables();
        }
    };

    const focusAt = (tabbableIndex: number) => {
        const tabbable = tabbables[(currentTabbableIndex = unsignedModulo(tabbableIndex, tabbables.length))];
        (tabbable as HTMLElement).focus();
        return tabbable ?? null;
    };

    const getTabbables = () => {
        tabbables.length = 0;

        for (const maybeTabbable of rootElement.querySelectorAll(SELECTORS)) {
            if (!isTabbable(maybeTabbable)) continue;
            if (elementWithFocus() === maybeTabbable) currentTabbableIndex = tabbables.length;
            tabbables.push(maybeTabbable);
        }
    };

    const handleTab = function (this: TabbableRoot, evt: KeyboardEvent) {
        if (active && evt.code === InteractionKeyCode.TAB) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            if (this.tabbables.length > 1) return !!this[evt.shiftKey ? 'prev' : 'next']();
        }
        return false;
    };

    const shouldRefresh = (records: MutationRecord[]) => {
        for (const record of records) {
            if (record.type !== 'attributes') {
                for (const node of record.addedNodes) if (isTabbable(node as Element)) return true;
                for (const node of record.removedNodes) if (tabbables.includes(node as Element)) return true;
            } else if (isTabbable(record.target as Element)) return true;
            else if (tabbables.includes(record.target as Element)) return true;
        }
        return false;
    };

    if (hasFocusWithin(rootElement) || !deferredActivation) activate();

    return Object.create(null, {
        activate: { value: activate },
        active: { get: () => active },
        current: { get: () => tabbables[currentTabbableIndex] ?? null },
        handleTab: { value: handleTab },
        next: { value: () => focusAt(++currentTabbableIndex) },
        prev: { value: () => focusAt(--currentTabbableIndex) },
        tabbables: { value: tabbables },
    }) as TabbableRoot;
};

export default createTabbableRoot;

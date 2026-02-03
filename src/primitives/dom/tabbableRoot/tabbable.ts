import { isNullish, isNumber, isUndefined, mod, some } from '../../../utils';

export interface TabbableRoot {
    get current(): Element | null;
    set current(maybeTabbableOrOffset: Element | number | null);
    root: Element | null;
    tabbables: Element[];
}

export const SELECTORS = `:scope ${`
    a[href],
    audio[controls],
    video[controls],
    button,
    input,
    select,
    textarea,
    [contenteditable],
    [tabindex]
`.replace(/\s+/g, '')}`;

const ATTRIBUTES = ['contenteditable', 'controls', 'disabled', 'hidden', 'href', 'inert', 'tabindex'];
const CHECKED_RADIOS = new Map<HTMLFormElement, Map<string, HTMLInputElement | null>>();

const isInput = (element: Element): element is HTMLInputElement => element.tagName === 'INPUT';
const isRadio = (element: Element): element is HTMLInputElement => isInput(element) && element.type === 'radio';
const isCheckedRadio = (element: Element): element is HTMLInputElement => {
    const name = (element as HTMLInputElement).name;
    const form = (element as HTMLInputElement).form;
    const checkedRadiosForForm = CHECKED_RADIOS.get(form as HTMLFormElement);

    let checkedRadio = checkedRadiosForForm?.get(name);

    if (isUndefined(checkedRadio) && form) {
        checkedRadio = (form.querySelector(`:scope input[type=radio][name='${name}']:checked`) as HTMLInputElement) || null;
        CHECKED_RADIOS.set(form, (checkedRadiosForForm || new Map<string, HTMLInputElement | null>()).set(name, checkedRadio));
    }

    return checkedRadio === element;
};

const shouldRefresh = (tabbables: Element[], records: MutationRecord[]) => {
    let shouldRefreshTabbables = false;

    for (const record of records) {
        if (record.type === 'attributes') {
            shouldRefreshTabbables ||=
                record.target instanceof Element &&
                // Target is a tabbable element (possibly due to attribute changes)
                // For example, disabled set to false, tabindex set to a number, etc.
                (isTabbable(record.target) ||
                    // Target is already contained in the list of tabbables
                    // Attribute changes could make it no longer tabbable (e.g. disabled set to true)
                    tabbables.includes(record.target));
        } else {
            shouldRefreshTabbables ||=
                // At least one tabbable node was added to the DOM tree of the root element
                some(
                    record.addedNodes,
                    (node: Node) =>
                        node instanceof Element &&
                        // Added node is a tabbable element
                        (isTabbable(node) ||
                            node.shadowRoot ||
                            // At least one descendant of added node is a tabbable element
                            some(node.querySelectorAll(SELECTORS), isTabbable))
                );

            shouldRefreshTabbables ||=
                // At least one tabbable node was removed from the DOM tree of the root element
                // That is, removed from the list of tabbables for the root element
                some(
                    record.removedNodes,
                    (node: Node) =>
                        node instanceof Element &&
                        // Removed node is a tabbable element
                        (tabbables.includes(node) ||
                            node.shadowRoot ||
                            // At least one descendant of removed node is a tabbable element
                            some(node.querySelectorAll(SELECTORS), node => tabbables.includes(node)))
                );
        }

        if (shouldRefreshTabbables) break;
    }

    return shouldRefreshTabbables;
};

export const focusIsWithin = (rootElement: Element = document.body, elementWithFocus?: Element | null): boolean => {
    if (isUndefined(rootElement)) return false;
    if (isNullish(elementWithFocus)) return !!document.activeElement && focusIsWithin(rootElement, document.activeElement);

    let parentElement = elementWithFocus?.parentNode as Node | null;

    while (parentElement) {
        if (parentElement === rootElement) return true;
        parentElement = parentElement instanceof ShadowRoot ? parentElement.host : parentElement?.parentNode || null;
    }

    return false;
};

export const isFocusable = (element: Element) =>
    !(
        // [TODO]: Include all of these checks
        // (1) matches focusable elements selector
        // (2) is disabled element
        // (3) is inert or inert subtree child
        // (4) is hidden input
        // (5) with visibility: hidden
        // (6) is summary of open details element
        // (7) is details with summary element
        // (8) is disabled fieldset subtree child

        /* (1) */ (
            !element.matches(SELECTORS) ||
            /* (2) */ (element as HTMLInputElement)?.disabled ||
            /* (3) */ /^(true)?$/.test(element.getAttribute('inert') as string) ||
            /* (4) */ (isInput(element) && element.hidden)
        )
    );

export const isTabbable = (element: Element) =>
    !(
        (
            (isRadio(element) && !isCheckedRadio(element)) || // (1) is not checked radio button
            (element as HTMLElement)?.tabIndex < 0 || // (2) has negative tabindex
            !isFocusable(element)
        ) // (3) is not focusable
    );

export const withTabbableRoot = () => {
    const observer = new MutationObserver(records => shouldRefresh(tabbables, records) && getTabbables());
    const tabbables: Element[] = [];

    let currentIndex = -1;
    let root: Element | null = null;

    const focusAt = (tabbableIndex: number) => {
        if (tabbableIndex < 0) return;
        const constrainedIndex = Math.min(tabbableIndex, tabbables.length - 1);
        if (currentIndex !== constrainedIndex) currentIndex = constrainedIndex;
        (tabbables[currentIndex] as HTMLElement)?.focus();
    };

    const findAllTabbables = (rootNode: Node) => {
        observer.observe(rootNode, {
            attributeFilter: ATTRIBUTES,
            attributes: true,
            childList: true,
            subtree: true,
        });

        const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_ELEMENT, {
            acceptNode: () => NodeFilter.FILTER_ACCEPT,
        });

        let currentNode = walker.nextNode();

        while (currentNode) {
            const element = currentNode as Element;
            if (isTabbable(element)) tabbables.push(element);
            if (element.shadowRoot) findAllTabbables(element.shadowRoot);
            currentNode = walker.nextNode();
        }
    };

    const getTabbables = () => {
        tabbables.length = 0;
        if (!root) return;
        findAllTabbables(root);
        if (!focusIsWithin(root)) return;
        tabbableRoot.current = document.activeElement;
    };

    const tabbableRoot = Object.create(null, {
        current: {
            get: () => tabbables[currentIndex] ?? null,
            set: (maybeTabbableOrOffset: Element | number | null) => {
                if (!maybeTabbableOrOffset) return;
                if (!isNumber(maybeTabbableOrOffset)) return focusAt(tabbables.indexOf(maybeTabbableOrOffset));
                if (maybeTabbableOrOffset !== ~~maybeTabbableOrOffset) return;
                return focusAt(mod(currentIndex + maybeTabbableOrOffset, tabbables.length));
            },
        },
        root: {
            get: () => root,
            set: (maybeElement?: any) => {
                if (maybeElement === root) return;

                root && observer.disconnect();
                root = maybeElement instanceof Element ? maybeElement : null;
                getTabbables();
            },
        },
        tabbables: { value: tabbables },
    }) as TabbableRoot;

    return tabbableRoot;
};

export default withTabbableRoot;

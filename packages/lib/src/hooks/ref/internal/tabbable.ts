export interface TabbableRoot {
    rootElement: Element | null;
    tabbables: Element[];
}

const SELECTORS = `
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

const ATTRIBUTES = ['contenteditable', 'controls', 'disabled', 'hidden', 'href', 'inert', 'tabindex'];
const CHECKED_RADIOS = new Map<HTMLFormElement, Map<string, HTMLInputElement | null>>();

const isInput = (element: Element): element is HTMLInputElement => element.tagName === 'INPUT';
const isRadio = (element: Element): element is HTMLInputElement => isInput(element) && element.type === 'radio';
const isCheckedRadio = (element: Element): element is HTMLInputElement => {
    const name = (element as HTMLInputElement).name;
    const form = (element as HTMLInputElement).form;
    const checkedRadiosForForm = CHECKED_RADIOS.get(form as HTMLFormElement);

    let checkedRadio = checkedRadiosForForm?.get(name);

    if (checkedRadio === undefined && form) {
        checkedRadio = (form.querySelector(`input[type=radio][name='${name}']:checked`) as HTMLInputElement) || null;
        CHECKED_RADIOS.set(form, (checkedRadiosForForm || new Map<string, HTMLInputElement | null>()).set(name, checkedRadio));
    }

    return checkedRadio === element;
};

const shouldRefresh = (tabbables: Element[], records: MutationRecord[]) => {
    for (const record of records) {
        if (record.type !== 'attributes') {
            for (const node of record.addedNodes) if (isTabbable(node as Element)) return true;
            for (const node of record.removedNodes) if (tabbables.includes(node as Element)) return true;
        } else if (isTabbable(record.target as Element)) return true;
        else if (tabbables.includes(record.target as Element)) return true;
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

    let root: Element | null = null;

    const getTabbables = () => {
        tabbables.length = 0;
        if (!(root instanceof Element)) return;
        for (const maybeTabbable of root.querySelectorAll(SELECTORS)) isTabbable(maybeTabbable) && tabbables.push(maybeTabbable);
    };

    return Object.create(null, {
        rootElement: {
            get: () => root,
            set: (maybeElement?: any) => {
                if (maybeElement === root) return;

                root && observer.disconnect();
                root = maybeElement instanceof Element ? maybeElement : null;
                tabbables.length = 0;

                if (!root) return;

                observer.observe(root, {
                    attributeFilter: ATTRIBUTES,
                    attributes: true,
                    childList: true,
                    subtree: true,
                });

                getTabbables();
            },
        },
        tabbables: { value: tabbables },
    }) as TabbableRoot;
};

export default withTabbableRoot;

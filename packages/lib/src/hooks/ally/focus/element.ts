const elementWithFocus = (() => {
    let element = document.activeElement;

    document.addEventListener(
        'focusout',
        (evt: FocusEvent) => {
            element = ((evt.relatedTarget || document.activeElement) as Element) ?? null;
        },
        true
    );

    return () => element;
})();

export default elementWithFocus;

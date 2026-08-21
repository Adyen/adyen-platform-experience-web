export const scrollToFirstErrorField = (errorFields: string[], visibilityOffset: number, scope?: ParentNode | null): void => {
    if (errorFields.length === 0) return;

    const queryScope = scope ?? document;

    const errorFieldsSelector = errorFields.map(field => `[name="${field}"]`).join(',');
    const elements = queryScope.querySelectorAll<HTMLElement>(`:scope ${errorFieldsSelector}`);

    const firstElement = Array.from(elements).reduce<HTMLElement | null>((topmost, el) => {
        if (!topmost) return el;
        return el.getBoundingClientRect().top < topmost.getBoundingClientRect().top ? el : topmost;
    }, null);

    if (!firstElement) return;

    const rect = firstElement.getBoundingClientRect();
    const isVisible = rect.top >= visibilityOffset && rect.bottom <= window.innerHeight;

    if (!isVisible) {
        firstElement.style.scrollMarginTop = `${visibilityOffset}px`;
        firstElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

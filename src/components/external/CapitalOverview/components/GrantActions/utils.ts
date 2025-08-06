/**
 * Gets the href from the topmost window (useful when we're inside an iframe).
 *
 * @returns The href from the topmost window
 */
export const getTopWindowHref = () => {
    // To get the top level href
    return window.top?.location.href || window.location.href;
};

/**
 * Sets the href of the topmost window (useful when we're inside an iframe)
 *
 * @param href - The href value to be set
 */
export const setTopWindowHref = (href: string) => {
    if (window.top) {
        // To set the top level href (useful when component is rendered inside an iframe)
        window.top.location.href = href;
    } else {
        window.location.href = href;
    }
};

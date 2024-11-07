/**
 * Calls `Element.prototype.removeAttribute` on the specified `elem`, with the specified rest arguments.
 * This function offers some null-safety using optional chaining, since `elem` can be `null`.
 */
export const removeAttr = (elem: Element | null, ...args: Parameters<typeof Element.prototype.removeAttribute>) =>
    void elem?.removeAttribute(...args);

/**
 * Calls `Element.prototype.setAttribute` on the specified `elem`, with the specified rest arguments.
 * This function offers some null-safety using optional chaining, since `elem` can be `null`.
 */
export const setAttr = (elem: Element | null, ...args: Parameters<typeof Element.prototype.setAttribute>) => void elem?.setAttribute(...args);

/**
 * Performs arithmetic addition operation with its two arguments, with some special care to minimize floating-point
 * precision errors. If both arguments are integers, then the arithmetic addition operator (+) should be used instead.
 */
export const add = (a: number, b: number) => {
    const exponent = Math.max(getIntExponent(a), getIntExponent(b));
    return (getWithExponent(a, exponent) + getWithExponent(b, exponent)) / getWithExponent(1, exponent);
};

/**
 * Performs arithmetic division operation with its two arguments, with some special care to minimize floating-point
 * precision errors. If both arguments are integers, then the arithmetic division operator (/) should be used instead.
 */
export const divide = (a: number, b: number) => {
    const exponent = Math.max(getIntExponent(a), getIntExponent(b));
    return getWithExponent(a, exponent) / getWithExponent(b, exponent);
};

/**
 * Returns as many powers of 10 as possible that will be needed to absorb the decimal portion of a number.
 * For integers or non-finite numbers, this function will return `0`. For numbers with decimal portion, this function
 * returns a positive integer up to a maximum of 16 (which is the maximum number of decimal places for JavaScript).
 */
export const getIntExponent = (num: number) => {
    if (!Number.isFinite(num)) return 0;
    let exponent = 0;
    let n = num;
    while (true) {
        if (n === Math.trunc(n)) return exponent;
        n = getWithExponent(num, ++exponent);
    }
};

/**
 * Returns the result of `{number} * 10 ^ {exponent}`, with some special care to minimize floating-point precision
 * errors.
 */
export const getWithExponent = (num: number, exponent = 0) => +`${num}e${++exponent}`;

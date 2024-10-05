export const attr = (elem: Element | null, ...args: Parameters<typeof Element.prototype.setAttribute>) => elem?.setAttribute(...args);
export const removeAttr = (elem: Element | null, ...args: Parameters<typeof Element.prototype.removeAttribute>) => elem?.removeAttribute(...args);

export const add = (a: number, b: number) => {
    const exponent = Math.max(getIntExponent(a), getIntExponent(b));
    return (getWithExponent(a, exponent) + getWithExponent(b, exponent)) / getWithExponent(1, exponent);
};

export const divide = (a: number, b: number) => {
    const exponent = Math.max(getIntExponent(a), getIntExponent(b));
    return getWithExponent(a, exponent) / getWithExponent(b, exponent);
};

export const getIntExponent = (num: number) => {
    let exponent = 0;
    let n = num;
    while (true) {
        if (n === Math.trunc(n)) return exponent;
        n = getWithExponent(num, ++exponent);
    }
};

export const getWithExponent = (num: number, exponent = 0) => +`${num}e${++exponent}`;

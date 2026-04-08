export const uniqueId = (() => {
    let counter = Date.now();
    return (prefix = 'adyen-pe') => `${prefix}-${++counter}`;
})();

export default uniqueId;

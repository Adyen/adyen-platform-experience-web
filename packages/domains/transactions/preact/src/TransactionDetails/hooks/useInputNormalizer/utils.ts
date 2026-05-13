export const assertInteger = (value: number, subject = 'value') => {
    if (!Number.isInteger(value)) throw new TypeError(`${subject.trim()} must be an integer`);
};

export const assertPositive = (value: number, subject = 'value') => {
    if (value < 0) throw new TypeError(`${subject.trim()} cannot be negative`);
};

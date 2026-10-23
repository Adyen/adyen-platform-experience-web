type DropdownValue = string | number | { value?: string | number | null } | Array<unknown> | null | undefined;

/** The value a Bento dropdown reports, which is either the selected value or its option, or `undefined` without a single value. */
export const getDropdownValue = (value: DropdownValue): string | undefined => {
    if (Array.isArray(value)) return undefined;
    const nextValue = typeof value === 'object' && value !== null ? value.value : value;
    // `!= null` also skips a `null` from Bento, which `String()` would otherwise turn into a "null" value.
    return nextValue != null ? String(nextValue) : undefined;
};

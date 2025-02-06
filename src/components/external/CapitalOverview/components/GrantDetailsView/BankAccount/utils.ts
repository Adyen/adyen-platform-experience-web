export const getHumanReadableIban = (iban: string, useNonBreakingSpaces = true) => {
    const spaceSeparator = (useNonBreakingSpaces as any) !== false ? ' ' : ' ';
    const ibanWithoutSpaces = iban.replace(/\s+/g, '');
    return ibanWithoutSpaces.replace(/([A-Z\d]{4}(?!$))/gi, `$1${spaceSeparator}`);
};

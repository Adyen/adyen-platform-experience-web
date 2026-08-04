export const TRANSACTION_DATE_RANGE_MAX_YEARS = 2;

export function getEarliestTransactionDate(currentDate: Date): Date {
    const earliestDate = new Date(currentDate);
    earliestDate.setFullYear(earliestDate.getFullYear() - TRANSACTION_DATE_RANGE_MAX_YEARS);
    return earliestDate;
}

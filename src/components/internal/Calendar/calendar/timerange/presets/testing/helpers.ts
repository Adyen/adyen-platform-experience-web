import { getMonthDays as _getMonthDays } from '../../../utils';
import type { Month, MonthDays } from '../../../types';

export const asTimestamp = (dates: any[]) => dates.map(date => new Date(date).getTime());
export const getMonthDays = (month: Month, year: number): MonthDays => _getMonthDays(month, year)[0];

import { isReportsTranslationKey, type ReportsTranslationKey } from '../translations';

type ReportsTypeTranslationKey = Extract<ReportsTranslationKey, `reports.common.types.${string}`>;

export const getReportType = (i18n: Readonly<{ get(key: ReportsTypeTranslationKey): string }>, value?: string): string | undefined => {
    if (value === undefined) return undefined;
    const key = `reports.common.types.${value}`;
    return isReportsTranslationKey(key) && key.startsWith('reports.common.types.') ? i18n.get(key as ReportsTypeTranslationKey) : value;
};

import { isPayoutsTranslationKey, type PayoutsTranslationKey } from '../translations';

/**
 * The exact payout keys these helpers can produce. Shared with the Preact elements, whose
 * `Localization` i18n accepts the public V1 catalog: this subset keeps both the Preact and the
 * Vue i18n assignable without exposing the full domain catalog union.
 */
type PayoutsTypeTranslationKey = Extract<
    PayoutsTranslationKey,
    `payouts.details.breakdown.adjustments.types.${string}` | `payouts.details.breakdown.fundsCaptured.types.${string}`
>;

type PayoutsTypeI18n = Readonly<{ get(key: PayoutsTypeTranslationKey): string }>;

const getPayoutType = (i18n: PayoutsTypeI18n, prefix: string, value?: string): string | undefined => {
    if (value === undefined) return undefined;
    const key = `${prefix}${value}`;
    return isPayoutsTranslationKey(key) ? i18n.get(key as PayoutsTypeTranslationKey) : value;
};

export const getPayoutAdjustmentType = (i18n: PayoutsTypeI18n, value?: string): string | undefined =>
    getPayoutType(i18n, 'payouts.details.breakdown.adjustments.types.', value);

export const getPayoutFundsCapturedType = (i18n: PayoutsTypeI18n, value?: string): string | undefined =>
    getPayoutType(i18n, 'payouts.details.breakdown.fundsCaptured.types.', value);

import { useCoreContext } from '@integration-components/core/vue';
import type { ICashOutAmount } from '@integration-components/types';

/** Formats an amount with its currency symbol and code, such as `$1,234.56 USD`. */
export const useFormatAmount = () => {
    const { i18n } = useCoreContext();

    return ({ value, currency }: ICashOutAmount): string => `${i18n.amount(value, currency)} ${currency}`;
};

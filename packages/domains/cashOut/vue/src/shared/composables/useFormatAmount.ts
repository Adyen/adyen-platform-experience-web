import { useCoreContext } from '@integration-components/core/vue';
import type { ICashOutAmount } from '@integration-components/types';

/** Formats an amount with its currency symbol, such as `$1,234.56`, like the Capital components. */
export const useFormatAmount = () => {
    const { i18n } = useCoreContext();

    return ({ value, currency }: ICashOutAmount): string => i18n.amount(value, currency);
};

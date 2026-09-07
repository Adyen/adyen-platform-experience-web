import { computed, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { BASE_LOCALE } from '@integration-components/utils/datetime/restamper/constants';

const useActiveTimezone = (timezone?: MaybeRefOrGetter<string | undefined>) => {
    const { i18n } = useCoreContext();

    return computed(() => {
        const timezoneValue = toValue(timezone);
        if (!timezoneValue) return i18n.timezone;
        try {
            return new Intl.DateTimeFormat(BASE_LOCALE, { timeZone: timezoneValue }).resolvedOptions().timeZone;
        } catch {
            return i18n.timezone;
        }
    });
};

const useTimezoneAwareDateFormatting = (timezone?: MaybeRefOrGetter<string | undefined>) => {
    const { i18n } = useCoreContext();
    const activeTimezone = useActiveTimezone(timezone);

    const dateFormat: typeof i18n.date = (date, options) => {
        return i18n.date(date, { timeZone: activeTimezone.value, ...options });
    };

    const fullDateFormat: typeof i18n.fullDate = date => {
        return i18n.date(date, {
            timeZone: activeTimezone.value,
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    };

    return { dateFormat, fullDateFormat } as const;
};

export default useTimezoneAwareDateFormatting;

import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';

const useActiveTimezone = (timezone?: string) => {
    const { i18n } = useCoreContext();

    return computed(() => {
        const timezoneToRestore = i18n.timezone;
        try {
            i18n.timezone = undefined;
            i18n.timezone = timezone;
            return i18n.timezone!;
        } finally {
            i18n.timezone = timezoneToRestore;
        }
    });
};

const useTimezoneAwareDateFormatting = (timezone?: string) => {
    const { i18n } = useCoreContext();
    const activeTimezone = useActiveTimezone(timezone);

    const dateFormat: typeof i18n.date = (date, options) => {
        const timezoneToRestore = i18n.timezone;
        try {
            i18n.timezone = activeTimezone.value;
            return i18n.date(date, options);
        } finally {
            i18n.timezone = timezoneToRestore;
        }
    };

    const fullDateFormat: typeof i18n.fullDate = date => {
        const timezoneToRestore = i18n.timezone;
        try {
            i18n.timezone = activeTimezone.value;
            return i18n.fullDate(date);
        } finally {
            i18n.timezone = timezoneToRestore;
        }
    };

    return { dateFormat, fullDateFormat } as const;
};

export default useTimezoneAwareDateFormatting;

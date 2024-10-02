import { useCallback, useMemo } from 'preact/hooks';
import useCoreContext from '../core/Context/useCoreContext';

const _useAtomicTimezoneOperation = <Args extends any[], ReturnValue>(operation: (...args: Args) => ReturnValue) => {
    const { i18n } = useCoreContext();

    return useCallback(
        (...args: Args) => {
            // capture timezone to restore
            const timezoneToRestore = i18n.timezone;
            try {
                // perform timezone operation
                return operation(...args);
            } finally {
                // restore timezone
                i18n.timezone = timezoneToRestore;
            }
        },
        [i18n, operation]
    );
};

const _useActiveTimezone = (timezone?: string) => {
    const { i18n } = useCoreContext();

    const getActiveTimezone = _useAtomicTimezoneOperation(
        useCallback(() => {
            // first reset to system timezone,
            // then attempt to set the specified timezone,
            // will fail silently if specified timezone is invalid
            i18n.timezone = undefined;
            i18n.timezone = timezone;
            return i18n.timezone!;
        }, [i18n, timezone])
    );

    return useMemo(getActiveTimezone, [getActiveTimezone]);
};

const useTimezoneAwareDateFormatting = (timezone?: string) => {
    const { i18n } = useCoreContext();
    const activeTimezone = _useActiveTimezone(timezone);

    const dateFormat = _useAtomicTimezoneOperation(
        useCallback<(typeof i18n)['date']>(
            (...args) => {
                i18n.timezone = activeTimezone;
                return i18n.date(...args);
            },
            [i18n, activeTimezone]
        )
    );

    const fullDateFormat = _useAtomicTimezoneOperation(
        useCallback<(typeof i18n)['fullDate']>(
            (...args) => {
                i18n.timezone = activeTimezone;
                return i18n.fullDate(...args);
            },
            [i18n, activeTimezone]
        )
    );

    return { dateFormat, fullDateFormat } as const;
};

export default useTimezoneAwareDateFormatting;

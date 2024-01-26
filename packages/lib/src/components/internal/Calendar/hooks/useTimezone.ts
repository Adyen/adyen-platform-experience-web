import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import restamper, { RestampContext } from '@src/core/Localization/datetime/restamper';
import { noop } from '@src/utils/common';
import watchable from '@src/utils/watchable';

const useTimezone = (timezone?: RestampContext['TIMEZONE']) => {
    const _restamper = useMemo(restamper, []);
    const _unwatch = useRef(noop);
    const _cleanup = useCallback(() => _unwatch.current(), []);
    const _watchable = useMemo(() => watchable({ tz: () => _restamper.tz! }), [_restamper]);
    const [, setLastUpdatedTimestamp] = useState<DOMHighResTimeStamp>(performance.now());

    useMemo(() => {
        const currentTimezone = _restamper.tz.current;
        try {
            _restamper.tz = timezone;
        } catch (ex) {
            _restamper.tz = currentTimezone;
            if (import.meta.env.DEV) console.error(ex);
        } finally {
            _watchable.notify();
        }
    }, [_restamper, _watchable, timezone]);

    useEffect(() => {
        _cleanup();
        _unwatch.current = _watchable.watch(() => setLastUpdatedTimestamp(performance.now()));
        return _cleanup;
    }, [_cleanup, _watchable]);

    return { getZonedTimestamp: _restamper } as const;
};

export default useTimezone;

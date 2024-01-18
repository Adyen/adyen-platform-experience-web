import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import restamper from '@src/core/Localization/datetime/restamper';
import type { Restamp } from '@src/core/Localization/types';
import { noop } from '@src/utils/common';
import watchable from '@src/utils/watchable';

const useTimezone = (timezone?: Restamp['tz']['current']) => {
    const _restamp = useMemo(restamper, []);
    const _unwatch = useRef(noop);
    const _cleanup = useCallback(() => _unwatch.current(), []);
    const _watchable = useMemo(() => watchable({ tz: () => _restamp.tz! }), [_restamp]);
    const [, setLastUpdatedTimestamp] = useState<DOMHighResTimeStamp>(performance.now());

    useMemo(() => {
        const currentTimezone = _restamp.tz.current;
        try {
            _restamp.tz = timezone;
        } catch (ex) {
            _restamp.tz = currentTimezone;
            if (import.meta.env.DEV) console.error(ex);
        } finally {
            _watchable.notify();
        }
    }, [_restamp, _watchable, timezone]);

    useEffect(() => {
        _cleanup();
        _unwatch.current = _watchable.watch(() => setLastUpdatedTimestamp(performance.now()));
        return _cleanup;
    }, [_cleanup, _watchable]);

    return { getTimezoneTimestamp: _restamp } as const;
};

export default useTimezone;

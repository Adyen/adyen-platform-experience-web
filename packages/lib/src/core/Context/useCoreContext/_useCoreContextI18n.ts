import { useEffect, useMemo, useState } from 'preact/hooks';
import Localization from '@src/core/Localization';
import { struct } from '@src/utils/common';
import { CoreContextI18n } from '../types';

export default function _useCoreContextI18n(this: any, i18n: Localization['i18n'] = new Localization().i18n) {
    const [lastRefreshTimestamp, setLastRefreshTimestamp] = useState(i18n.lastRefreshTimestamp);

    useEffect(() => i18n.watch(() => setLastRefreshTimestamp(i18n.lastRefreshTimestamp)), [i18n]);

    return useMemo(() => {
        const { customTranslations, lastRefreshTimestamp, load, ready, watch, ...restDescriptors } = Object.getOwnPropertyDescriptors(i18n);

        const __load__ = load.value as Localization['load'];
        const __this__ = this;

        load.value = function (this: any, ...args) {
            if (this === __this__) return __load__(...args);
            throw new Error('Illegal invocation');
        } as CoreContextI18n['load'];

        return struct({ ...restDescriptors, load }) as CoreContextI18n;
    }, [i18n, lastRefreshTimestamp]);
}

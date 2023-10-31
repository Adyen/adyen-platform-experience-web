import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useDefinedValue from '@src/hooks/useDefinedValue';
import Localization from '@src/core/Localization';
import { noop } from '@src/utils/common';
import { TranslationsContextThisBinding } from '../types';

export default function _useTranslationsI18n(this: unknown, i18n?: Localization['i18n']) {
    const _i18n = useDefinedValue(() => new Localization().i18n, i18n);
    const [, setLastRefresh] = useState(_i18n.lastRefreshTimestamp);
    const watchI18n = useCallback(() => setLastRefresh(_i18n.lastRefreshTimestamp), [_i18n, setLastRefresh]);
    const unwatchI18n = useRef(noop);

    const effectWithUnmountCallback = useMemo(() => {
        const unmount = () => {
            unwatchI18n.current?.();
            unwatchI18n.current = null as unknown as typeof unwatchI18n.current;
            (this as TranslationsContextThisBinding).reset();
        };
        return () => unmount;
    }, []);

    useEffect(effectWithUnmountCallback, []);

    useEffect(() => {
        unwatchI18n.current?.();
        unwatchI18n.current = _i18n.watch(watchI18n);
    }, [_i18n, watchI18n]);

    return useMemo(() => {
        (this as TranslationsContextThisBinding).i18n = _i18n;
        return (this as TranslationsContextThisBinding).i18n;
    }, [_i18n]);
}

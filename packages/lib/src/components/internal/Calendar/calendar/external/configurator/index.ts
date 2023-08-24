import { CALENDAR_CONTROLS, FIRST_WEEK_DAYS, FRAME_SIZES } from '../../constants';
import { AnnualTimeFrame, DefaultTimeFrame, TimeFrame } from '../../internal/timeframe';
import { CalendarConfig, CalendarConfigurator } from '../../types';
import { boolify, noop, pickFromCollection, struct } from '../../shared/utils';
import { WatchAtoms, WatchCallable } from '../../shared/watchable/types';
import watchable from '../../shared/watchable';
import syncEffectCallback from '@src/utils/syncEffectCallback';

const createConfigurator = (beforeEffectCallback?: WatchCallable<any>) => {
    let _config = {} as CalendarConfig;
    let _pendingNotification = false;
    let _frame: TimeFrame;
    let _unwatch: () => void;
    let _unwatchFrame: () => void;

    const _watchable = watchable({
        blocks: () => _config?.blocks,
        controls: () => _config?.controls,
        firstWeekDay: () => _config?.firstWeekDay,
        locale: () => _config?.locale,
        minified: () => _config?.minified,
        timeslice: () => _config?.timeslice,
        withMinimumHeight: () => _config?.withMinimumHeight,
        withRangeSelection: () => _config?.withRangeSelection,
    } as WatchAtoms<CalendarConfig>);

    const chainedCallback = syncEffectCallback(() => {
        if (typeof props.watch !== 'function') return;
        beforeEffectCallback?.();
        props.watch.call(configurator.config);
    });

    const configurePropDescriptors = {} as {
        [K in keyof typeof props]: PropertyDescriptor;
    };

    const props = {
        cursorIndex: undefined,
        shiftFactor: undefined,
        watch: undefined,
    } as { [K in keyof CalendarConfigurator['configure']]?: CalendarConfigurator['configure'][K] };

    const _cleanup = () => {
        _unwatchFrame?.();
        _unwatch?.();
        _unwatch = _unwatchFrame = undefined as unknown as typeof _unwatch;
        _frame = undefined as unknown as typeof _frame;
        configure = noop;
    };

    let configure = (config: CalendarConfig): void => {
        _config = {
            ..._config,
            ...config,
            blocks: pickFromCollection(FRAME_SIZES, _config.blocks, config.blocks),
            controls: pickFromCollection(CALENDAR_CONTROLS, _config.controls, config.controls),
            firstWeekDay: pickFromCollection(FIRST_WEEK_DAYS, _config.firstWeekDay, config.firstWeekDay),
            locale: config.locale ?? _config.locale ?? 'en',
            minified: boolify(config.minified, _config.minified),
            withMinimumHeight: boolify(config.withMinimumHeight, _config.withMinimumHeight),
            withRangeSelection: boolify(config.withRangeSelection, _config.withRangeSelection),
        };

        if (typeof props.watch !== 'function') {
            if (!_frame) {
                _frame = (_config.minified as boolean) ? new AnnualTimeFrame() : new DefaultTimeFrame();

                _frame.timeslice = _config.timeslice;
                _frame.firstWeekDay = _config.firstWeekDay;
                _frame.size = _config.blocks;

                beforeEffectCallback?.();
            } else _pendingNotification = true;

            return;
        }

        _watchable.notify();

        if (!_unwatch) {
            _unwatch = _watchable.watch(
                (() => {
                    let minified = !!_config.minified;
                    const watchCallback = chainedCallback(noop);

                    return chainedCallback(() => {
                        if (!_frame || minified !== _config.minified) {
                            _unwatchFrame?.();
                            _frame = (minified = _config.minified as boolean) ? new AnnualTimeFrame() : new DefaultTimeFrame();
                            _unwatchFrame = _frame.watchable.watch(watchCallback);
                        }

                        _frame.timeslice = _config.timeslice;
                        _frame.firstWeekDay = _config.firstWeekDay;
                        _frame.size = _config.blocks;

                        watchCallback();
                    });
                })()
            );
        }
    };

    for (const key of Object.keys(props) as (keyof typeof props)[]) {
        let set = (value: WatchCallable<any, CalendarConfig> | null) => {
            if (value == undefined) props[key] = undefined;
            else if (typeof value === 'function') props[key] = value;
        };

        if (key === 'watch') {
            const setter = set;

            set = (value: WatchCallable<any, CalendarConfig> | null) => {
                setter(value);
                if (typeof props[key] === 'function' && _pendingNotification) {
                    _pendingNotification = false;
                    _watchable.notify();
                }
            };
        }

        configurePropDescriptors[key] = { set, get: () => props[key] };
    }

    const configurator = struct({
        cleanup: { value: _cleanup },
        config: { get: () => ({ ..._config }) },
        configure: {
            value: Object.defineProperties((config?: CalendarConfig) => {
                config && configure(config);
                return _watchable.snapshot;
            }, configurePropDescriptors),
        },
        frame: { get: () => _frame },
    }) as CalendarConfigurator;

    return configurator;
};

export default createConfigurator;

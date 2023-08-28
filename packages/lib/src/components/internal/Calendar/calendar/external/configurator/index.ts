import { CALENDAR_CONTROLS, FIRST_WEEK_DAYS, FRAME_SIZES } from '../../constants';
import { AnnualTimeFrame, DefaultTimeFrame, TimeFrame } from '../../internal/timeframe';
import { CalendarConfig, CalendarConfigurator } from '../../types';
import { EMPTY_OBJECT } from '../../shared/constants';
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
    let _watchCallback: () => void;
    let _watchableCallback: () => void;

    let _watchable = watchable({
        blocks: () => _config?.blocks,
        controls: () => _config?.controls,
        firstWeekDay: () => _config?.firstWeekDay,
        locale: () => _config?.locale,
        minified: () => _config?.minified,
        timeslice: () => _config?.timeslice,
        withMinimumHeight: () => _config?.withMinimumHeight,
        withRangeSelection: () => _config?.withRangeSelection,
    } as WatchAtoms<CalendarConfig>);

    let _chainedCallback = syncEffectCallback(() => {
        if (typeof _props?.watch !== 'function') return;
        beforeEffectCallback?.();
        _props?.watch.call(configurator.config);
    });

    let _configurePropDescriptors = {} as {
        [K in keyof typeof _props]: PropertyDescriptor;
    };

    let _props = {
        cursorIndex: undefined,
        shiftFactor: undefined,
        watch: undefined,
    } as { [K in keyof CalendarConfigurator['configure']]?: CalendarConfigurator['configure'][K] };

    let _cleanup = () => {
        for (const prop of Object.keys(_props ?? EMPTY_OBJECT) as (keyof typeof _props)[]) _props[prop] = undefined;
        _props = undefined as unknown as typeof _props;

        _unwatchFrame?.();
        _unwatch?.();
        _cleanup =
            _configure =
            _chainedCallback =
            _getTimeFrame =
            _updateTimeFrame =
            _unwatch =
            _unwatchFrame =
            _watchCallback =
            _watchableCallback =
                undefined as unknown as () => any;
        _watchable = undefined as unknown as typeof _watchable;
        _frame = undefined as unknown as typeof _frame;
        _config = EMPTY_OBJECT;
    };

    let _getTimeFrame = () => ((_config.minified as boolean) ? new AnnualTimeFrame() : new DefaultTimeFrame());

    let _updateTimeFrame = (frame?: TimeFrame) => {
        if (!frame) return;
        frame.timeslice = _config.timeslice;
        frame.firstWeekDay = _config.firstWeekDay;
        frame.size = _config.blocks;
        frame.useMinimumLines = _config.withMinimumHeight;
    };

    let _configure = (config: CalendarConfig): void => {
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

        if (typeof _props?.watch !== 'function') {
            if (!_frame) {
                _updateTimeFrame?.((_frame = _getTimeFrame?.()));
                beforeEffectCallback?.();
            } else _pendingNotification = true;

            return;
        }

        _watchable?.notify();

        if (!_unwatch) {
            _unwatch = _watchable?.watch(
                (() => {
                    let minified = !!_config.minified;
                    _watchCallback = _chainedCallback(noop);

                    return (_watchableCallback = _chainedCallback(() => {
                        if (!_frame || minified !== _config.minified) {
                            _unwatchFrame?.();
                            _frame = _getTimeFrame?.();
                            _unwatchFrame = _frame?.watchable.watch(_watchCallback);
                        }

                        _updateTimeFrame?.(_frame);
                        _watchCallback?.();
                    }));
                })()
            );
        }
    };

    for (const key of Object.keys(_props) as (keyof typeof _props)[]) {
        let set = (value: WatchCallable<any, CalendarConfig> | null) => {
            if (!_props) return;
            if (value == undefined) _props[key] = undefined;
            else if (typeof value === 'function') _props[key] = value;
        };

        if (key === 'watch') {
            const setter = set;

            set = (value: WatchCallable<any, CalendarConfig> | null) => {
                setter(value);
                if (typeof _props?.[key] === 'function' && _pendingNotification) {
                    _pendingNotification = false;
                    _watchable.notify();
                }
            };
        }

        _configurePropDescriptors[key] = { set, get: () => _props?.[key] };
    }

    const configurator = struct({
        cleanup: { value: () => _cleanup?.() },
        config: { get: () => ({ ..._config }) },
        configure: {
            value: Object.defineProperties((config?: CalendarConfig) => {
                config && _configure?.(config);
                return _watchable?.snapshot ?? configurator.config;
            }, _configurePropDescriptors),
        },
        frame: { get: () => _frame },
    }) as CalendarConfigurator;

    _configurePropDescriptors = undefined as unknown as typeof _configurePropDescriptors;

    return configurator;
};

export default createConfigurator;

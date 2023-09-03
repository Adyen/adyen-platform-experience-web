import { InteractionKeyCode } from '@src/components/types';
import {
    CALENDAR_CONTROLS,
    CALENDAR_SELECTIONS,
    CONTROLS_ALL,
    CONTROLS_MINIMAL,
    CONTROLS_NONE,
    CURSOR_BACKWARD,
    CURSOR_BLOCK_END,
    CURSOR_BLOCK_START,
    CURSOR_DOWNWARD,
    CURSOR_FORWARD,
    CURSOR_LINE_END,
    CURSOR_LINE_START,
    CURSOR_NEXT_BLOCK,
    CURSOR_PREV_BLOCK,
    CURSOR_UPWARD,
    FIRST_WEEK_DAYS,
    FRAME_SIZES,
    SELECT_MANY,
    SELECT_NONE,
    SELECT_ONE,
    SELECTION_COLLAPSE,
    SELECTION_FROM,
    SELECTION_TO,
    SHIFT_BLOCK,
    SHIFT_FRAME,
    SHIFT_PERIOD,
} from '../constants';
import { EMPTY_OBJECT, immutableProxyHandlers } from '../shared/constants';
import indexed from '../shared/indexed';
import { boolify, isBitSafeInteger, noop, pickFromCollection, struct, structFrom } from '../shared/utils';
import watchable from '../shared/watchable';
import { Watchable, WatchableFactory, WatchCallable, WatchCallback } from '../shared/watchable/types';
import { MonthFrame, TimeFrame, YearFrame } from '../timeframe';
import today from '../today';
import {
    CalendarConfig,
    CalendarDayOfWeekData,
    CalendarGrid,
    CalendarGridControlRecord,
    CalendarShiftControl,
    CalendarShiftControlFlag,
    CalendarShiftControlsFlag,
    CalendarWatchAtoms,
} from '../types';

export default class Calendar {
    grid: CalendarGrid;
    kill: () => void;
    #config = EMPTY_OBJECT as CalendarConfig;
    #destructed = false;
    #frame?: TimeFrame;
    #highlightFrom?: number;
    #highlightTo?: number;
    #highlightInProgress = false;
    #pendingWatchNotification = false;

    #cursorIndexFromEvent?: CalendarGrid['config']['cursorIndex'];
    #shiftFactorFromEvent?: CalendarGrid['config']['shiftFactor'];
    #watchCallback?: CalendarGrid['config']['watch'];
    #watchableEffect?: () => void;
    #unwatch?: () => void;

    #shiftControlsHandles: CalendarGridControlRecord[1][] = [];
    #shiftControlsList?: CalendarShiftControl[];

    #shiftControls = new Proxy(
        indexed(() => this.#shiftControlsList?.length ?? 0, this.#getShiftControlRecordAtIndex.bind(this)),
        {
            ...immutableProxyHandlers,
            get: (target: {}, property: string | symbol, receiver: {}): any => {
                const index = this.#shiftControlsList?.indexOf(property as CalendarShiftControl) ?? -1;
                return index >= 0 ? this.#getShiftControlRecordAtIndex(index)?.[1] : Reflect.get(target, property, receiver);
            },
        }
    ) as CalendarGrid['controls'];

    #watchable?: Watchable<CalendarWatchAtoms> = watchable({
        blocks: () => this.#frame?.size,
        cells: () => this.#frame?.units,
        controls: () => pickFromCollection(CALENDAR_CONTROLS, this.#config.controls),
        cursor: () => this.#frame?.cursor,
        from: () => this.#frame?.selectionStart,
        highlight: () => pickFromCollection(CALENDAR_SELECTIONS, this.#config.highlight),
        locale: () => this.#frame?.locale,
        minified: () => boolify(this.#config.minified),
        origin: () => this.#frame?.getTimestampAtIndex(0),
        to: () => this.#frame?.selectionEnd,
        today: () => today.timestamp,
    });

    #lastWatchableSnapshot?: CalendarWatchAtoms = this.#watchable?.snapshot;

    #chainedNotifyCallback?: ReturnType<WatchableFactory['withSyncEffect']> = watchable.withSyncEffect(
        () => this.#watchCallback && this.#watchable?.notify()
    );

    #chainedWatchCallback?: ReturnType<WatchableFactory['withSyncEffect']> = watchable.withSyncEffect(() =>
        this.#watchCallback?.call(this.#currentConfig)
    );

    #grid = structFrom(
        indexed(
            () => this.#frame?.size ?? 0,
            index => this.#frame?.frameBlocks[index]
        ),
        {
            config: {
                value: Object.defineProperties(
                    (config?: CalendarConfig) => {
                        config && this.#configure(config);
                        return this.#currentConfig;
                    },
                    {
                        cursorIndex: {
                            get: () => this.#cursorIndexFromEvent,
                            set: (fn: CalendarGrid['config']['cursorIndex'] | null | undefined) => {
                                if (this.#destructed) return;
                                if (fn == undefined) this.#cursorIndexFromEvent = undefined;
                                else if (typeof fn === 'function') this.#cursorIndexFromEvent = fn;
                            },
                        },
                        shiftFactor: {
                            get: () => this.#shiftFactorFromEvent,
                            set: (fn: CalendarGrid['config']['shiftFactor'] | null | undefined) => {
                                if (this.#destructed) return;
                                if (fn == undefined) this.#shiftFactorFromEvent = undefined;
                                else if (typeof fn === 'function') this.#shiftFactorFromEvent = fn;
                            },
                        },
                        watch: {
                            get: () => this.#watchCallback,
                            set: (fn: CalendarGrid['config']['watch'] | null | undefined) => {
                                if (this.#destructed) return;
                                if (typeof fn === 'function') {
                                    this.#watchCallback = fn;

                                    if (!this.#watchableEffect) {
                                        const watchCallback = this.#chainedNotifyCallback?.(Calendar.#watchableEffectCallback.bind(this));

                                        if (watchCallback) {
                                            this.#watchableEffect = this.#chainedNotifyCallback?.(noop);
                                            this.#unwatch = this.#watchable?.watch(this.#chainedWatchCallback?.(watchCallback));
                                            this.#frame && (this.#frame.effect = this.#watchableEffect);
                                        }
                                    }

                                    if (!this.#pendingWatchNotification) return;

                                    this.#pendingWatchNotification = false;
                                    this.#watchableEffect?.();
                                } else if (fn == undefined) this.#watchCallback = undefined;
                            },
                        },
                    }
                ),
            },
            controls: { value: this.#shiftControls },
            cursor: {
                value: Object.defineProperties(
                    Calendar.#withNotifyEffect.call(this, (evt?: Event) => !!(evt && this.#cursorHandle(evt))),
                    {
                        valueOf: { value: () => this.#frame?.cursor ?? -1 },
                    }
                ),
            },
            highlight: {
                value: (() => {
                    const blank = () => this.#highlightFrom === this.#highlightTo && this.#highlightTo === undefined;

                    const setter = (selection: typeof SELECTION_FROM | typeof SELECTION_TO) =>
                        Calendar.#withNotifyEffect.call(this, (time?: number | null) => {
                            if (time == undefined) return this.#clearHighlight();

                            this.#frame?.updateSelection(
                                time,
                                this.#lastWatchableSnapshot?.highlight === SELECT_ONE || blank() ? SELECTION_COLLAPSE : selection
                            );
                            this.#highlightFrom = this.#frame?.selectionStart;
                            this.#highlightTo = this.#frame?.selectionEnd;
                        });

                    return struct({
                        blank: { get: blank },
                        from: {
                            get: () => this.#frame?.selectionStart,
                            set: setter(SELECTION_FROM),
                        },
                        to: {
                            get: () => this.#frame?.selectionEnd,
                            set: setter(SELECTION_TO),
                        },
                    });
                })(),
            },
            rowspan: { get: () => this.#frame?.rowspan ?? 0 },
            weekdays: { get: () => this.#frame?.daysOfWeek ?? Calendar.#DAYS_OF_WEEK_FALLBACK },
        }
    ) as CalendarGrid;

    static #CURSOR_POINTER_INTERACTION_EVENTS = ['click', 'mouseover', 'pointerover'];
    static #DAYS_OF_WEEK_FALLBACK = indexed<CalendarDayOfWeekData, {}>(0, noop as any);
    static #SHIFT_ACTIVATION_KEYS = [InteractionKeyCode.ENTER, InteractionKeyCode.SPACE];
    static #SHIFT_ALL_CONTROLS = Object.keys(CalendarShiftControlsFlag).filter(control => isNaN(+control)) as CalendarShiftControl[];
    static #SHIFT_MINIMAL_CONTROLS = ['PREV', 'NEXT'] as CalendarShiftControl[];

    static #getShiftOffsetType(flags: number) {
        switch (flags & ~CalendarShiftControlFlag.PREV) {
            case CalendarShiftControlFlag.FRAME:
                return SHIFT_FRAME;
            case CalendarShiftControlFlag.PERIOD:
                return SHIFT_PERIOD;
            case CalendarShiftControlFlag.BLOCK:
            default:
                return SHIFT_BLOCK;
        }
    }

    static #getShiftOffsetUnit(flags: number) {
        return flags & CalendarShiftControlFlag.PREV ? -1 : 1;
    }

    static #watchableEffectCallback: WatchCallback<CalendarWatchAtoms> = function (this: Calendar, signalOrSnapshot) {
        if (typeof signalOrSnapshot === 'symbol') return;

        let controlsChanged = false;
        let highlightChanged = false;
        let selectionChanged = false;

        for (const key of Object.keys(signalOrSnapshot) as (keyof typeof signalOrSnapshot)[]) {
            if (signalOrSnapshot[key] === this.#lastWatchableSnapshot?.[key]) continue;
            if (key === 'controls') controlsChanged = true;
            else if (key === 'highlight') highlightChanged = true;
            else if (key === 'from' || key === 'to') selectionChanged = true;
        }

        this.#lastWatchableSnapshot = signalOrSnapshot;

        if (this.#highlightInProgress && !selectionChanged) this.#restoreHighlight();
        if (controlsChanged) this.#refreshShiftControls();
        if (highlightChanged) this.#refreshHighlighting();
    };

    static #withNotifyEffect(this: Calendar, fn: WatchCallable<any>) {
        return this.#chainedNotifyCallback?.(fn) ?? fn;
    }

    constructor() {
        this.grid = this.#grid;
        this.kill = this.#destruct.bind(this);
    }

    get #currentConfig() {
        return { ...this.#config } as CalendarConfig;
    }

    get #timeframe() {
        return (this.#config.minified as boolean) ? new YearFrame() : new MonthFrame();
    }

    #canShiftInDirection(shiftDirection: 1 | -1) {
        return !!this.#frame && !(shiftDirection > 0 ? this.#frame.isAtEnd : this.#frame.isAtStart);
    }

    #configure(config: CalendarConfig) {
        if (this.#destructed) return;

        const minified = boolify(this.#config.minified);

        this.#config = {
            ...this.#config,
            ...config,
            blocks: pickFromCollection(FRAME_SIZES, config?.blocks, this.#config.blocks),
            controls: pickFromCollection(CALENDAR_CONTROLS, config?.controls, this.#config.controls),
            firstWeekDay: pickFromCollection(FIRST_WEEK_DAYS, config?.firstWeekDay, this.#config.firstWeekDay),
            fixedBlockHeight: boolify(config?.fixedBlockHeight, this.#config.fixedBlockHeight),
            highlight: pickFromCollection(CALENDAR_SELECTIONS, config?.highlight, this.#config.highlight),
            minified: boolify(config?.minified, this.#config.minified),
            trackCurrentDay: boolify(config?.trackCurrentDay, this.#config.trackCurrentDay),
        };

        if (typeof this.#watchCallback !== 'function') {
            if (!this.#frame) {
                this.#frame = this.#timeframe;
                this.#reframe();
                this.#refreshShiftControls();
                this.#refreshHighlighting();
            } else this.#pendingWatchNotification = true;

            return;
        }

        if (!this.#frame || minified !== this.#config.minified) {
            this.#frame = this.#timeframe;
            this.#frame.effect = this.#watchableEffect;
        }

        this.#reframe();
        this.#watchableEffect?.();
    }

    #cursorHandle(evt?: Event): true | undefined {
        if (!(evt && this.#frame && typeof this.#watchCallback === 'function')) return;

        if (evt instanceof KeyboardEvent) {
            switch (evt.code) {
                case InteractionKeyCode.ARROW_LEFT:
                    this.#frame.shiftFrameCursor(CURSOR_BACKWARD);
                    break;
                case InteractionKeyCode.ARROW_RIGHT:
                    this.#frame.shiftFrameCursor(CURSOR_FORWARD);
                    break;
                case InteractionKeyCode.ARROW_UP:
                    this.#frame.shiftFrameCursor(CURSOR_UPWARD);
                    break;
                case InteractionKeyCode.ARROW_DOWN:
                    this.#frame.shiftFrameCursor(CURSOR_DOWNWARD);
                    break;
                case InteractionKeyCode.HOME:
                    this.#frame.shiftFrameCursor(evt.ctrlKey ? CURSOR_BLOCK_START : CURSOR_LINE_START);
                    break;
                case InteractionKeyCode.END:
                    this.#frame.shiftFrameCursor(evt.ctrlKey ? CURSOR_BLOCK_END : CURSOR_LINE_END);
                    break;
                case InteractionKeyCode.PAGE_UP:
                    this.#frame.shiftFrameCursor(CURSOR_PREV_BLOCK);
                    break;
                case InteractionKeyCode.PAGE_DOWN:
                    this.#frame.shiftFrameCursor(CURSOR_NEXT_BLOCK);
                    break;
                case InteractionKeyCode.SPACE:
                case InteractionKeyCode.ENTER:
                    this.#highlight();
                    return true;
                default:
                    return;
            }

            this.#highlightInProgress && this.#highlight(EMPTY_OBJECT);
            return true;
        }

        if (
            evt instanceof MouseEvent &&
            Calendar.#CURSOR_POINTER_INTERACTION_EVENTS.includes(evt.type) &&
            typeof this.#cursorIndexFromEvent === 'function'
        ) {
            const cursorIndex = this.#cursorIndexFromEvent.call(this.#currentConfig, evt);

            if (!isBitSafeInteger(cursorIndex)) return;

            const isClick = evt.type === 'click';

            if (!(isClick || this.#highlightInProgress)) return;
            this.#frame.shiftFrameCursor(cursorIndex);

            if (this.#frame.cursor === cursorIndex) {
                isClick ? this.#highlight() : this.#highlight(EMPTY_OBJECT);
                return true;
            }
        }
    }

    #destruct() {
        if (this.#destructed) return;

        this.#unwatch?.();

        this.#chainedNotifyCallback =
            this.#chainedWatchCallback =
            this.#cursorIndexFromEvent =
            this.#frame =
            this.#lastWatchableSnapshot =
            this.#shiftFactorFromEvent =
            this.#unwatch =
            this.#watchable =
            this.#watchableEffect =
            this.#watchCallback =
                undefined;

        this.#config = EMPTY_OBJECT;
        this.#highlightInProgress = this.#pendingWatchNotification = false;
        this.#destructed = true;
    }

    #getShiftControlRecordAtIndex(index: number): CalendarGridControlRecord | undefined {
        if (!this.#shiftControlsList || index < 0 || index >= this.#shiftControlsList.length) return;

        const control = this.#shiftControlsList[index] as CalendarShiftControl;

        if (!this.#shiftControlsHandles[index]) {
            const flags = CalendarShiftControlsFlag[control];
            const shiftOffsetType = Calendar.#getShiftOffsetType(flags);
            const shiftOffsetUnit = Calendar.#getShiftOffsetUnit(flags);

            this.#shiftControlsHandles[index] = Calendar.#withNotifyEffect.call(this, (...args: any[]) => {
                const canShift = this.#canShiftInDirection(shiftOffsetUnit);
                if (!(canShift && args.length)) return canShift;

                const shiftFactor = this.#getShiftFactorFromEvent(control, args[0] as Event);
                if (shiftFactor === undefined) return false;

                this.#frame?.shiftFrameByOffset(shiftOffsetUnit * shiftFactor, shiftOffsetType);
                return true;
            });
        }

        return [control, this.#shiftControlsHandles[index] as CalendarGridControlRecord[1]];
    }

    #getShiftFactorFromEvent(target: CalendarShiftControl, evt?: Event): number | undefined {
        if (!(this.#frame && typeof this.#watchCallback === 'function')) return;

        if (evt instanceof MouseEvent) {
            if (evt.type !== 'click') return;
        } else if (evt instanceof KeyboardEvent) {
            if (!Calendar.#SHIFT_ACTIVATION_KEYS.includes(evt.code as InteractionKeyCode)) return;
        } else return;

        let shiftFactor = 1;

        if (typeof this.#shiftFactorFromEvent === 'function') {
            const factor = Number(this.#shiftFactorFromEvent.call(this.#currentConfig, evt, target));
            shiftFactor = Number.isInteger(factor) && factor >= 1 ? factor : shiftFactor;
        }

        return shiftFactor;
    }

    #highlight(secretFauxHighlightingHint?: any) {
        if (this.#destructed || !this.#frame) return;

        const selection = this.#watchable?.snapshot.highlight;

        switch (selection) {
            case SELECT_MANY:
            case SELECT_ONE:
                break;
            case SELECT_NONE:
            default:
                return;
        }

        const cursor = this.#frame.cursor;
        const fromTimestamp = this.#frame.getTimestampAtIndex(cursor);
        const toTimestamp = this.#frame.getTimestampAtIndex(cursor + 1) - 1;

        if (selection === SELECT_ONE || this.#frame.blankSelection) {
            this.#highlightInProgress = selection === SELECT_MANY;
            this.#frame.updateSelection(fromTimestamp, SELECTION_FROM);
            this.#frame.updateSelection(toTimestamp, SELECTION_TO);
        } else {
            const isFauxHighlighting = secretFauxHighlightingHint === EMPTY_OBJECT;

            if (!isFauxHighlighting) this.#highlightInProgress = false;

            fromTimestamp < (this.#frame.selectionStart as number)
                ? this.#frame.updateSelection(fromTimestamp, SELECTION_FROM)
                : this.#frame.updateSelection(toTimestamp, SELECTION_TO);

            if (isFauxHighlighting) return;
        }

        this.#highlightFrom = this.#frame.selectionStart;
        this.#highlightTo = this.#frame.selectionEnd;
    }

    #clearHighlight() {
        this.#frame?.clearSelection();
        this.#highlightInProgress = false;
        this.#highlightFrom = this.#highlightTo = undefined;
    }

    #restoreHighlight() {
        this.#clearHighlight();
        this.#highlightFrom && this.#frame?.updateSelection(this.#highlightFrom, SELECTION_FROM);
        this.#highlightTo && this.#frame?.updateSelection(this.#highlightTo, SELECTION_TO);
    }

    #reframe() {
        if (!this.#frame) return;

        this.#frame.timeslice = this.#config.timeslice;
        this.#frame.dynamicBlockHeight = !this.#config.fixedBlockHeight;
        this.#frame.firstWeekDay = this.#config.firstWeekDay;
        this.#frame.size = this.#config.blocks;
        this.#frame.trackCurrentDay = this.#config.trackCurrentDay;

        this.#restoreHighlight();
    }

    #refreshHighlighting() {
        const selection = this.#watchable?.snapshot.highlight;

        switch (selection) {
            case SELECT_MANY:
            case SELECT_ONE:
                break;
            case SELECT_NONE:
            default:
                this.#clearHighlight();
                return;
        }

        if (selection === SELECT_ONE && this.#frame?.blankSelection === false) {
            this.#frame?.updateSelection(new Date(this.#frame?.selectionStart as number).setHours(23, 59, 59, 999), SELECTION_TO);
        }
    }

    #refreshShiftControls() {
        switch (this.#watchable?.snapshot.controls) {
            case CONTROLS_ALL:
                this.#shiftControlsList = Calendar.#SHIFT_ALL_CONTROLS;
                break;
            case CONTROLS_MINIMAL:
                this.#shiftControlsList = Calendar.#SHIFT_MINIMAL_CONTROLS;
                break;
            case CONTROLS_NONE:
            default:
                this.#shiftControlsList = undefined;
        }

        this.#shiftControlsHandles.length = 0;
        this.#shiftControlsHandles.length = this.#shiftControlsList?.length ?? 0;
    }
}

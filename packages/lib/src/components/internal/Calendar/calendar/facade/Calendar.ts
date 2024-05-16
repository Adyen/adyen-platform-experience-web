import { InteractionKeyCode } from '../../../../types';
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
import { createIndexed } from '../../../../../primitives/struct/indexed';
import { createEffectStack, EffectStack } from '../../../../../primitives/reactive/effectStack';
import {
    createWatchlist,
    isWatchlistUnsubscribeToken,
    WatchList,
    WatchListCallable,
    WatchListSubscriptionCallback,
} from '../../../../../primitives/reactive/watchlist';
import today from '../../../../../primitives/timing/today';
import {
    boolify,
    boolOrTrue,
    EMPTY_OBJECT,
    isBitSafeInteger,
    isFunction,
    isNullish,
    isString,
    isUndefined,
    noop,
    pickFrom,
    struct,
    structFrom,
    withFreezeProxyHandlers,
} from '../../../../../utils';
import { MonthFrame, TimeFrame /* , YearFrame */ } from '../timeframe';
import {
    CalendarConfig,
    CalendarDayOfWeekData,
    CalendarGrid,
    CalendarGridControlRecord,
    CalendarSelection,
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
    #highlightSelection?: CalendarSelection = SELECT_NONE;
    #pendingWatchNotification = false;
    #rangeOffsets?: [number, number, number, number, number, number];
    #lastHighlightRange?: string = this.#rangeOffsets?.join(' ');

    #cursorIndexFromEvent?: CalendarGrid['config']['cursorIndex'];
    #shiftFactorFromEvent?: CalendarGrid['config']['shiftFactor'];
    #watchCallback?: CalendarGrid['config']['watch'];
    #watchableEffect?: () => void;
    #unwatch?: () => void;

    #today = today();
    #shiftControlsHandles: CalendarGridControlRecord[1][] = [];
    #shiftControlsList?: CalendarShiftControl[];

    #shiftControls = new Proxy(
        createIndexed(() => this.#shiftControlsList?.length ?? 0, this.#getShiftControlRecordAtIndex.bind(this)),
        withFreezeProxyHandlers({
            get: (target: {}, property: string | symbol, receiver: {}): any => {
                const index = this.#shiftControlsList?.indexOf(property as CalendarShiftControl) ?? -1;
                return index >= 0 ? this.#getShiftControlRecordAtIndex(index)?.[1] : Reflect.get(target, property, receiver);
            },
        })
    ) as CalendarGrid['controls'];

    #watchlist?: WatchList<CalendarWatchAtoms> = createWatchlist({
        blocks: () => this.#frame?.size,
        cells: () => this.#frame?.units,
        controls: () => pickFrom(CALENDAR_CONTROLS, this.#config.controls),
        cursor: () => this.#frame?.cursor,
        from: () => this.#frame?.selectionStart,
        highlight: () => this.#highlightSelection,
        locale: () => this.#frame?.locale,
        minified: () => boolify(this.#config.minified),
        origin: () => this.#frame?.getTimestampAtIndex(0),
        to: () => this.#frame?.selectionEnd,
        today: () => this.#today.timestamp,
    });

    #lastWatchableSnapshot?: CalendarWatchAtoms = this.#watchlist?.snapshot;

    #chainedNotifyEffectStack?: EffectStack = createEffectStack(() => this.#watchCallback && this.#watchlist?.requestNotification());

    #chainedWatchEffectStack?: EffectStack = createEffectStack(() => this.#watchCallback?.call(this.#currentConfig));

    #grid = structFrom(
        createIndexed(
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
                                if (isNullish(fn)) this.#cursorIndexFromEvent = undefined;
                                else if (isFunction(fn)) this.#cursorIndexFromEvent = fn;
                            },
                        },
                        shiftFactor: {
                            get: () => this.#shiftFactorFromEvent,
                            set: (fn: CalendarGrid['config']['shiftFactor'] | null | undefined) => {
                                if (this.#destructed) return;
                                if (isNullish(fn)) this.#shiftFactorFromEvent = undefined;
                                else if (isFunction(fn)) this.#shiftFactorFromEvent = fn;
                            },
                        },
                        watch: {
                            get: () => this.#watchCallback,
                            set: (fn: CalendarGrid['config']['watch'] | null | undefined) => {
                                if (this.#destructed) return;
                                if (isFunction(fn)) {
                                    this.#watchCallback = fn;

                                    if (!this.#watchableEffect) {
                                        const watchCallback = this.#chainedNotifyEffectStack?.bind(Calendar.#watchableEffectCallback.bind(this));

                                        if (watchCallback) {
                                            this.#watchableEffect = this.#chainedNotifyEffectStack?.bind(noop);
                                            this.#unwatch = this.#watchlist?.subscribe(this.#chainedWatchEffectStack?.bind(watchCallback));
                                            this.#frame && (this.#frame.effect = this.#watchableEffect);
                                        }
                                    }

                                    if (!this.#pendingWatchNotification) return;

                                    this.#pendingWatchNotification = false;
                                    this.#watchableEffect?.();
                                } else if (isNullish(fn)) this.#watchCallback = undefined;
                            },
                        },
                    }
                ),
            },
            controls: { value: this.#shiftControls },
            cursor: {
                value: Object.defineProperties(
                    (evt?: Event) => Calendar.#withNotifyEffect.call(this, (evt?: Event) => !!(evt && this.#cursorHandle(evt)))(evt),
                    {
                        valueOf: { value: () => this.#frame?.cursor ?? -1 },
                    }
                ),
            },
            highlight: {
                value: (() => {
                    const blank = () => this.#highlightFrom === this.#highlightTo && isUndefined(this.#highlightTo);

                    const setter = (selection: typeof SELECTION_FROM | typeof SELECTION_TO) => (time?: number | null) =>
                        Calendar.#withNotifyEffect.call(this, (time?: number | null) => {
                            if (this.#destructed || !this.#highlightSelection || this.#highlightSelection === SELECT_NONE) return;
                            if (isNullish(time)) return this.#clearHighlight();

                            if (!blank()) {
                                this.#frame?.updateSelection(time, selection);
                                if (this.#highlightSelection === SELECT_MANY && this.#rangeOffsets) {
                                    this.#rangeHighlight(time, selection === SELECTION_FROM ? SELECTION_TO : SELECTION_FROM, this.#rangeOffsets);
                                }
                            } else this.#frame?.updateSelection(time, SELECTION_COLLAPSE);

                            this.#highlightFrom = this.#frame?.selectionStart;
                            this.#highlightTo = this.#frame?.selectionEnd;
                            this.#frame?.shiftFrameToTimestamp(selection === SELECTION_FROM ? this.#highlightFrom : this.#highlightTo);
                        })(time);

                    return struct({
                        blank: { get: blank },
                        from: {
                            get: () => this.#frame?.selectionStart ?? this.#highlightFrom,
                            set: setter(SELECTION_FROM),
                        },
                        to: {
                            get: () => this.#frame?.selectionEnd ?? this.#highlightTo,
                            set: setter(SELECTION_TO),
                        },
                    });
                })(),
            },
            rowspan: { get: () => this.#frame?.rowspan ?? 0 },
            weekdays: { get: () => this.#frame?.daysOfWeek ?? Calendar.#DAYS_OF_WEEK_FALLBACK },
        }
    ) as CalendarGrid;

    static #RANGE_OFFSETS_FORMAT_REGEX = /^(?:0|[1-9]\d*)(\s+(?:0|[1-9]\d*)?){0,5}?$/;
    static #CURSOR_POINTER_INTERACTION_EVENTS = ['click', 'mouseover', 'pointerover'];
    static #DAYS_OF_WEEK_FALLBACK = createIndexed(0, noop as () => CalendarDayOfWeekData);
    static #SHIFT_ACTIVATION_KEYS = [InteractionKeyCode.ENTER, InteractionKeyCode.SPACE];
    static #SHIFT_ALL_CONTROLS = Object.keys(CalendarShiftControlsFlag).filter(control => isNaN(+control)) as CalendarShiftControl[];
    static #SHIFT_MINIMAL_CONTROLS = ['PREV', 'NEXT'] as CalendarShiftControl[];

    static #getOffsetsFromRange(range?: string): [number, number, number, number, number, number] | undefined {
        if (!isString(range)) return;
        if (!Calendar.#RANGE_OFFSETS_FORMAT_REGEX.test(range)) return;
        const offsets = range.split(/\s+/);
        return Array.from({ length: 6 }, (_, index) => parseInt(offsets[index] ?? '0')) as [number, number, number, number, number, number];
    }

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

    static #watchableEffectCallback: WatchListSubscriptionCallback<CalendarWatchAtoms> = function (this: Calendar, snapshot) {
        if (isWatchlistUnsubscribeToken(snapshot)) return;

        let controlsChanged = false;
        let highlightChanged = false;
        let selectionChanged = false;
        const highlightRange = this.#rangeOffsets?.join(' ');

        for (const key of Object.keys(snapshot) as (keyof typeof snapshot)[]) {
            if (snapshot[key] === this.#lastWatchableSnapshot?.[key]) continue;
            if (key === 'controls') controlsChanged = true;
            else if (key === 'highlight') highlightChanged = true;
            else if (key === 'from' || key === 'to') selectionChanged = true;
        }

        if (this.#lastHighlightRange !== highlightRange) {
            this.#lastHighlightRange = highlightRange;
            highlightChanged = true;
        }

        this.#lastWatchableSnapshot = snapshot;

        if (this.#highlightInProgress && !selectionChanged) this.#restoreHighlight();
        if (controlsChanged) this.#refreshShiftControls();
        if (highlightChanged) this.#refreshHighlighting();
    };

    static #withNotifyEffect<T extends WatchListCallable = WatchListCallable>(this: Calendar, fn: T) {
        return this.#chainedNotifyEffectStack?.bind(fn) ?? fn;
    }

    constructor() {
        this.grid = this.#grid;
        this.kill = this.#destruct.bind(this);
    }

    get #currentConfig() {
        return { ...this.#config } as CalendarConfig;
    }

    get #timeframe() {
        // return (this.#config.minified as boolean) ? new YearFrame() : new MonthFrame();
        return new MonthFrame();
    }

    #canShiftInDirection(shiftDirection: 1 | -1) {
        return !!this.#frame && !(shiftDirection > 0 ? this.#frame.isAtEnd : this.#frame.isAtStart);
    }

    #configure(config: CalendarConfig) {
        if (this.#destructed) return;

        this.#rangeOffsets = undefined;

        const highlight = config?.highlight;
        const minified = boolify(this.#config.minified);

        if (!isString(highlight)) {
            this.#highlightSelection = pickFrom(CALENDAR_SELECTIONS, highlight, this.#highlightSelection);
        } else if ((this.#rangeOffsets = Calendar.#getOffsetsFromRange(highlight))) {
            this.#highlightSelection = SELECT_MANY;
        }

        this.#config = {
            ...this.#config,
            ...config,
            blocks: pickFrom(FRAME_SIZES, config?.blocks, this.#config.blocks),
            controls: pickFrom(CALENDAR_CONTROLS, config?.controls, this.#config.controls),
            firstWeekDay: pickFrom(FIRST_WEEK_DAYS, config?.firstWeekDay, this.#config.firstWeekDay),
            fixedBlockHeight: boolify(config?.fixedBlockHeight, this.#config.fixedBlockHeight),
            highlight: this.#highlightSelection,
            minified: boolify(config?.minified, this.#config.minified),
            trackCurrentDay: boolify(config?.trackCurrentDay, this.#config.trackCurrentDay),
        };

        if (!isFunction(this.#watchCallback)) {
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
        if (!(evt && this.#frame && isFunction(this.#watchCallback))) return;

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
                    evt.shiftKey ? this.#frame.shiftFrameByOffset(-1, SHIFT_PERIOD) : this.#frame.shiftFrameCursor(CURSOR_PREV_BLOCK);
                    break;
                case InteractionKeyCode.PAGE_DOWN:
                    evt.shiftKey ? this.#frame.shiftFrameByOffset(1, SHIFT_PERIOD) : this.#frame.shiftFrameCursor(CURSOR_NEXT_BLOCK);
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

        if (evt instanceof MouseEvent && Calendar.#CURSOR_POINTER_INTERACTION_EVENTS.includes(evt.type) && isFunction(this.#cursorIndexFromEvent)) {
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

        this.#chainedNotifyEffectStack =
            this.#chainedWatchEffectStack =
            this.#cursorIndexFromEvent =
            this.#frame =
            this.#highlightSelection =
            this.#lastHighlightRange =
            this.#lastWatchableSnapshot =
            this.#rangeOffsets =
            this.#shiftFactorFromEvent =
            this.#unwatch =
            this.#watchlist =
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

            this.#shiftControlsHandles[index] = (...args: any[]) =>
                Calendar.#withNotifyEffect.call(this, (...args: any[]) => {
                    const canShift = this.#canShiftInDirection(shiftOffsetUnit);
                    if (!(canShift && args.length)) return canShift;

                    const shiftFactor = this.#getShiftFactorFromEvent(control, args[0] as Event);
                    if (isUndefined(shiftFactor)) return false;

                    this.#frame?.shiftFrameByOffset(shiftOffsetUnit * shiftFactor, shiftOffsetType);
                    return true;
                })(...args);
        }

        return [control, this.#shiftControlsHandles[index] as CalendarGridControlRecord[1]];
    }

    #getShiftFactorFromEvent(target: CalendarShiftControl, evt?: Event): number | undefined {
        if (!(this.#frame && isFunction(this.#watchCallback))) return;

        if (evt instanceof MouseEvent) {
            if (evt.type !== 'click') return;
        } else if (evt instanceof KeyboardEvent) {
            if (!Calendar.#SHIFT_ACTIVATION_KEYS.includes(evt.code as InteractionKeyCode)) return;
        } else return;

        let shiftFactor = 1;

        if (isFunction(this.#shiftFactorFromEvent)) {
            const factor = Number(this.#shiftFactorFromEvent.call(this.#currentConfig, evt, target));
            shiftFactor = Number.isInteger(factor) && factor >= 1 ? factor : shiftFactor;
        }

        return shiftFactor;
    }

    #highlight(secretFauxHighlightingHint?: any) {
        if (this.#destructed || !this.#frame) return;

        switch (this.#highlightSelection) {
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
        const range = this.#rangeOffsets;

        if (this.#highlightSelection === SELECT_ONE || this.#frame.blankSelection || range) {
            this.#highlightInProgress = !(this.#highlightSelection === SELECT_ONE || range);

            if (this.#highlightSelection === SELECT_MANY && range) {
                const selectionDirection = toTimestamp >= (this.#frame.selectionEnd as number) ? SELECTION_FROM : SELECTION_TO;

                selectionDirection === SELECTION_FROM
                    ? this.#frame.updateSelection(toTimestamp, SELECTION_TO)
                    : this.#frame.updateSelection(fromTimestamp, SELECTION_FROM);

                this.#rangeHighlight(
                    (selectionDirection === SELECTION_FROM ? this.#frame.selectionEnd : this.#frame.selectionStart) as number,
                    selectionDirection,
                    range
                );
            } else {
                this.#frame.updateSelection(fromTimestamp, SELECTION_FROM);
                this.#frame.updateSelection(toTimestamp, SELECTION_TO);
            }
        } else {
            const isFauxHighlighting = secretFauxHighlightingHint === EMPTY_OBJECT;

            if (!isFauxHighlighting) this.#highlightInProgress = false;

            if (fromTimestamp <= this.#frame.selectionStart!) {
                const selectionStartDay = new Date(this.#frame.selectionStart!);
                const selectionStartDayEndTimestamp = selectionStartDay.setDate(selectionStartDay.getDate() + 1) - 1;

                if (fromTimestamp === this.#frame.selectionStart! && toTimestamp <= selectionStartDayEndTimestamp) {
                    this.#frame.updateSelection(toTimestamp, SELECTION_TO);
                }

                this.#frame.updateSelection(fromTimestamp, SELECTION_FROM);
            } else {
                const selectionEndDay = new Date(this.#frame.selectionEnd!);
                const selectionEndDayStartTimestamp = selectionEndDay.setHours(0, 0, 0, 0);

                if (fromTimestamp <= this.#frame.selectionEnd! && fromTimestamp >= selectionEndDayStartTimestamp) {
                    this.#frame.updateSelection(fromTimestamp, SELECTION_FROM);
                }

                this.#frame.updateSelection(toTimestamp, SELECTION_TO);
            }

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

    #rangeHighlight(
        time: number,
        selectionDirection: typeof SELECTION_FROM | typeof SELECTION_TO,
        rangeOffsets?: [number, number, number, number, number, number]
    ) {
        if (!this.#frame) return;

        const date = new Date(time);
        const direction = selectionDirection === SELECTION_FROM ? -1 : 1;
        const [years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0] = rangeOffsets ?? [];

        date.setFullYear(date.getFullYear() + years * direction, date.getMonth() + months * direction, date.getDate() + days * direction);
        date.setHours(date.getHours() + hours * direction, date.getMinutes() + minutes * direction, date.getSeconds() + seconds * direction);

        this.#frame.updateSelection(date.getTime() - direction, selectionDirection);
    }

    #restoreHighlight() {
        this.#highlightFrom && this.#frame?.updateSelection(this.#highlightFrom, SELECTION_FROM);
        this.#highlightTo && this.#frame?.updateSelection(this.#highlightTo, SELECTION_TO);
        this.#highlightInProgress = false;
    }

    #reframe() {
        if (!this.#frame) return;

        this.#frame.timeslice = this.#config.timeslice;
        this.#frame.dynamicBlockHeight = !this.#config.fixedBlockHeight;
        this.#frame.firstWeekDay = this.#config.firstWeekDay;
        this.#frame.locale = this.#config.locale;
        this.#frame.size = this.#config.blocks;
        this.#frame.trackCurrentDay = this.#config.trackCurrentDay;

        this.#restoreHighlight();
    }

    #refreshHighlighting() {
        switch (this.#highlightSelection) {
            case SELECT_MANY:
                if (!boolOrTrue(this.#frame?.blankSelection) && this.#rangeOffsets) {
                    this.#rangeHighlight(this.#frame?.selectionStart!, SELECTION_TO, this.#rangeOffsets);
                }
                break;
            case SELECT_ONE:
                if (!boolOrTrue(this.#frame?.blankSelection)) {
                    this.#frame?.updateSelection(new Date(this.#frame?.selectionStart!).setHours(23, 59, 59, 999), SELECTION_TO);
                }
                break;
            case SELECT_NONE:
            default:
                this.#clearHighlight();
                return;
        }
    }

    #refreshShiftControls() {
        switch (this.#watchlist?.snapshot.controls) {
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

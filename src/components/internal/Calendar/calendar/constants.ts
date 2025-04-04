export const DAY_MS = 86400000 as const;
export const DAY_OF_WEEK_FORMATS = ['narrow', 'short', 'long'] as const;
export const FIRST_WEEK_DAYS = [0, 1, 6] as const;
export const FRAME_SIZES = [1, 2, 3, 4, 6, 12] as const;
export const MAXIMUM_MONTH_UNITS = 42 as const;
export const WEEKEND_DAYS_SEED = [0, 1] as const;
export const YEAR_MONTHS = 12 as const;
export const CONTROLS_ALL: unique symbol = Symbol();
export const CONTROLS_MINIMAL: unique symbol = Symbol();
export const CONTROLS_NONE: unique symbol = Symbol();
export const CALENDAR_CONTROLS = [CONTROLS_NONE, CONTROLS_MINIMAL, CONTROLS_ALL] as const;
export const SELECT_MANY: unique symbol = Symbol();
export const SELECT_NONE: unique symbol = Symbol();
export const SELECT_ONE: unique symbol = Symbol();
export const CALENDAR_SELECTIONS = [SELECT_NONE, SELECT_ONE, SELECT_MANY] as const;
export const CURSOR_BACKWARD: unique symbol = Symbol();
export const CURSOR_BLOCK_END: unique symbol = Symbol();
export const CURSOR_BLOCK_START: unique symbol = Symbol();
export const CURSOR_DOWNWARD: unique symbol = Symbol();
export const CURSOR_FORWARD: unique symbol = Symbol();
export const CURSOR_LINE_END: unique symbol = Symbol();
export const CURSOR_LINE_START: unique symbol = Symbol();
export const CURSOR_NEXT_BLOCK: unique symbol = Symbol();
export const CURSOR_PREV_BLOCK: unique symbol = Symbol();
export const CURSOR_UPWARD: unique symbol = Symbol();
export const RANGE_FROM: unique symbol = Symbol();
export const RANGE_TO: unique symbol = Symbol();
export const SELECTION_COLLAPSE: unique symbol = Symbol();
export const SELECTION_FARTHEST: unique symbol = Symbol();
export const SELECTION_FROM: unique symbol = Symbol();
export const SELECTION_NEAREST: unique symbol = Symbol();
export const SELECTION_TO: unique symbol = Symbol();
export const SHIFT_BLOCK: unique symbol = Symbol();
export const SHIFT_FRAME: unique symbol = Symbol();
export const SHIFT_PERIOD: unique symbol = Symbol();

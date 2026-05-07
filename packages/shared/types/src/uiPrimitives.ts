import type { ComponentChild, VNode } from 'preact';

export enum ButtonVariant {
    PRIMARY = 'primary',
    SECONDARY = 'secondary',
    TERTIARY = 'tertiary',
    TERTIARY_WITH_BACKGROUND = 'tertiary-with-background',
    LINK = 'link',
}

export interface ButtonActionObject {
    title: string;
    event: (event: Event) => void;
    disabled?: boolean;
    variant?: ButtonVariant;
    renderTitle?: (title: string) => ComponentChild;
    state?: 'loading' | 'default';
    classNames?: string[];
    iconLeft?: VNode<Element>;
    iconRight?: VNode<Element>;
    ariaLabel?: string;
}

export type ButtonActionsList = ButtonActionObject[] | readonly ButtonActionObject[];

export enum ButtonActionsLayoutBasic {
    BUTTONS_END = 'buttons-end',
    FILL_CONTAINER = 'fill-container',
    SPACE_BETWEEN = 'space-between',
    VERTICAL_STACK = 'vertical-stack',
}

export enum ButtonActionsLayoutExtended {
    BUTTONS_START = 'buttons-start',
}

export const ButtonActionsLayout = { ...ButtonActionsLayoutBasic, ...ButtonActionsLayoutExtended };
export type ButtonActionsLayout = ButtonActionsLayoutBasic | ButtonActionsLayoutExtended;

export type CellTextPosition = 'center' | 'right' | 'left';

export type ModalSize = 'fluid' | 'small' | 'large' | 'extra-large' | 'full-screen';

export enum InteractionKeyCode {
    ARROW_DOWN = 'ArrowDown',
    ARROW_LEFT = 'ArrowLeft',
    ARROW_RIGHT = 'ArrowRight',
    ARROW_UP = 'ArrowUp',
    BACKSPACE = 'Backspace',
    END = 'End',
    ENTER = 'Enter',
    ESCAPE = 'Escape',
    HOME = 'Home',
    PAGE_DOWN = 'PageDown',
    PAGE_UP = 'PageUp',
    SPACE = 'Space',
    TAB = 'Tab',
    DELETE = 'Delete',
}

export enum PopoverContainerVariant {
    TOOLTIP = 'tooltip',
    POPOVER = 'popover',
}

export enum PopoverContainerPosition {
    TOP = 'top',
    RIGHT = 'right',
    BOTTOM = 'bottom',
    LEFT = 'left',
    TOP_LEFT = 'top-left',
    TOP_RIGHT = 'top-right',
    BOTTOM_LEFT = 'bottom-left',
    BOTTOM_RIGHT = 'bottom-right',
}

export type TimeRangeOptions = 'last7Days' | 'last30Days' | 'last90Days' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'yearToDate';

export const TIME_RANGE_SELECTION_PRESET_OPTION_KEYS = Object.freeze({
    LAST_7_DAYS: 'common.filters.types.date.rangeSelect.options.last7Days',
    LAST_30_DAYS: 'common.filters.types.date.rangeSelect.options.last30Days',
    LAST_90_DAYS: 'common.filters.types.date.rangeSelect.options.last90Days',
    THIS_WEEK: 'common.filters.types.date.rangeSelect.options.thisWeek',
    LAST_WEEK: 'common.filters.types.date.rangeSelect.options.lastWeek',
    THIS_MONTH: 'common.filters.types.date.rangeSelect.options.thisMonth',
    LAST_MONTH: 'common.filters.types.date.rangeSelect.options.lastMonth',
    YEAR_TO_DATE: 'common.filters.types.date.rangeSelect.options.yearToDate',
} as const);

export type TimeRangeSelectionPresetOptionKey =
    (typeof TIME_RANGE_SELECTION_PRESET_OPTION_KEYS)[keyof typeof TIME_RANGE_SELECTION_PRESET_OPTION_KEYS];

export type TimeRangeSelectionOptions<RangeTimestamps> = Readonly<
    Partial<{ [P in TimeRangeOptions as `common.filters.types.date.rangeSelect.options.${P}`]: RangeTimestamps }>
>;

export type UseTimeRangeSelectionConfig<RangeTimestamps = unknown, Timezone = unknown, RangeTimestamp = number> = {
    clearable?: boolean;
    now?: RangeTimestamp;
    options: TimeRangeSelectionOptions<RangeTimestamps>;
    selectedOption?: string;
    timezone?: Timezone;
};

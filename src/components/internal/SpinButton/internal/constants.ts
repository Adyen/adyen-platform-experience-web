export const ATTR_ARIA_DISABLED = 'aria-disabled';
export const ATTR_ARIA_VALUE_MAX = 'aria-valuemax';
export const ATTR_ARIA_VALUE_MIN = 'aria-valuemin';
export const ATTR_ARIA_VALUE_NOW = 'aria-valuenow';
export const ATTR_DISABLED = 'disabled';
export const ATTR_ROLE = 'role';
export const ATTR_TAB_INDEX = 'tabindex';

export const ATTRS_STEP_CONTROL = [ATTR_DISABLED, ATTR_TAB_INDEX] as const;

export const ATTRS_SPIN_BUTTON = [
    ATTR_ARIA_DISABLED,
    ATTR_ARIA_VALUE_MAX,
    ATTR_ARIA_VALUE_MIN,
    ATTR_ARIA_VALUE_NOW,
    ATTR_ROLE,
    ATTR_TAB_INDEX,
] as const;

export const ROLE_SPIN_BUTTON = 'spinbutton';
export const NON_TABBABLE_TAB_INDEX = '-1';
export const TABBABLE_TAB_INDEX = '0';

export const DEFAULT_VALUE_LEAP = 0;
export const DEFAULT_VALUE_MAX = Number.POSITIVE_INFINITY;
export const DEFAULT_VALUE_MIN = Number.NEGATIVE_INFINITY;
export const DEFAULT_VALUE_NOW = Number.NaN;
export const DEFAULT_VALUE_STEP = 1;

export const EVENT_STATE_NOTIFICATION = 'spinbutton_state_notification';

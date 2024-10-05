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

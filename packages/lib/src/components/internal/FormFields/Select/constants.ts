import { DEFAULT_BUTTON_CLASSNAME } from '@src/components/internal/Button/constants';
import { ButtonVariant } from '@src/components/internal/Button/types';
import { getModifierClasses } from '@src/utils/class-name-utils';

export const DROPDOWN_BASE_CLASS = 'adyen-pe-dropdown';
export const DROPDOWN_BUTTON_CLASSNAME = getModifierClasses(DEFAULT_BUTTON_CLASSNAME, [ButtonVariant.SECONDARY], [DEFAULT_BUTTON_CLASSNAME]);
export const DROPDOWN_BUTTON_CLASS = `${DROPDOWN_BASE_CLASS}__button`;
export const DROPDOWN_BUTTON_ACTIVE_CLASS = `${DROPDOWN_BUTTON_CLASS}--active`;
export const DROPDOWN_BUTTON_COLLAPSE_INDICATOR_CLASS = `${DROPDOWN_BUTTON_CLASS}-collapse-indicator`;
export const DROPDOWN_BUTTON_HAS_SELECTION_CLASS = `${DROPDOWN_BUTTON_CLASS}--has-selection`;
export const DROPDOWN_BUTTON_ICON_CLASS = `${DROPDOWN_BUTTON_CLASS}-icon`;
export const DROPDOWN_BUTTON_MULTI_SELECT_COUNTER_CLASS = `${DROPDOWN_BUTTON_CLASS}-multiselect-counter`;
export const DROPDOWN_BUTTON_READONLY_CLASS = `${DROPDOWN_BUTTON_CLASS}--readonly`;
export const DROPDOWN_BUTTON_TEXT_CLASS = `${DROPDOWN_BUTTON_CLASS}-text`;
export const DROPDOWN_BUTTON_VALID_CLASS = `${DROPDOWN_BUTTON_CLASS}--valid`;
export const DROPDOWN_BUTTON_INVALID_CLASS = `${DROPDOWN_BUTTON_CLASS}--invalid`;
export const DROPDOWN_ELEMENT_CLASS = `${DROPDOWN_BASE_CLASS}__element`;
export const DROPDOWN_ELEMENT_ACTIVE_CLASS = `${DROPDOWN_ELEMENT_CLASS}--active`;
export const DROPDOWN_ELEMENT_CHECKBOX_CLASS = `${DROPDOWN_ELEMENT_CLASS}-checkbox`;
export const DROPDOWN_ELEMENT_CHECKMARK_CLASS = `${DROPDOWN_ELEMENT_CLASS}-checkmark`;
export const DROPDOWN_ELEMENT_CONTENT_CLASS = `${DROPDOWN_ELEMENT_CLASS}-content`;
export const DROPDOWN_ELEMENT_DISABLED_CLASS = `${DROPDOWN_ELEMENT_CLASS}--disabled`;
export const DROPDOWN_ELEMENT_ICON_CLASS = `${DROPDOWN_ELEMENT_CLASS}-icon`;
export const DROPDOWN_ELEMENT_NO_OPTION_CLASS = `${DROPDOWN_ELEMENT_CLASS}--no-option`;
export const DROPDOWN_LIST_CLASS = `${DROPDOWN_BASE_CLASS}__list`;
export const DROPDOWN_LIST_ACTIVE_CLASS = `${DROPDOWN_LIST_CLASS}--active`;
export const DROPDOWN_MULTI_SELECT_CLASS = `${DROPDOWN_BASE_CLASS}--multiselect`;

const NAMESPACE = 'adyen-pe-expandable-card';

// Block classes
export const BASE_CLASS = NAMESPACE;

// Element classes
export const CONTAINER_CLASS = BASE_CLASS + '__container';
export const CONTENT_CLASS = BASE_CLASS + '__content';
export const CHEVRON_CLASS = BASE_CLASS + '__chevron';

// Modifier classes
export const CONTAINER_BUTTON_CLASS = CONTAINER_CLASS + '--button';
export const CONTAINER_FILLED_CLASS = CONTAINER_CLASS + '--filled';
export const CONTAINER_HIDDEN_CLASS = CONTAINER_CLASS + '--hidden';
export const CONTAINER_IN_FLOW_CLASS = CONTAINER_CLASS + '--in-flow';
export const CONTAINER_OVERLAY_CLASS = CONTAINER_CLASS + '--overlay';
export const CONTENT_EXPANDABLE_CLASS = CONTENT_CLASS + '--expandable';

// Custom properties
export const CARD_HEIGHT_PROPERTY = `--${NAMESPACE}-height`;

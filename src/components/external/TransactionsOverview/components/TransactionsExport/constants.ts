const BASE_CLASS = 'adyen-pe-transactions-export';
const POPOVER_CLASS = BASE_CLASS + '__popover';

export const classes = {
    root: BASE_CLASS,
    popover: POPOVER_CLASS,
    button: BASE_CLASS + '__button',
    popoverActions: POPOVER_CLASS + '-actions',
    popoverSections: POPOVER_CLASS + '-sections',
    popoverSection: POPOVER_CLASS + '-section',
    columnsSection: POPOVER_CLASS + '-section--columns',
    filtersSection: POPOVER_CLASS + '-section--filters',
    popoverSectionTitle: POPOVER_CLASS + '-section-title',
    popoverSectionContent: POPOVER_CLASS + '-section-content',
    popoverColumnAll: POPOVER_CLASS + '-column--all',
    popoverColumn: POPOVER_CLASS + '-column',
} as const;

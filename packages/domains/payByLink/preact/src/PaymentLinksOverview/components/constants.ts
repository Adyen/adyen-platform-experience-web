import { IPaymentLinkStatusGroup } from '@integration-components/types';
import { TabComponentProps } from '@integration-components/ui-components-preact/Tabs/types';
import {
    DEFAULT_PAYMENT_LINK_STATUS_GROUP,
    EARLIEST_PAYMENT_LINK_DATE_DAYS,
    PAYMENT_LINK_STATUS_GROUPS,
    PAYMENT_LINK_STATUS_GROUPS_FILTER_MAPPING,
    PAYMENT_LINK_STATUSES,
    PAYMENT_LINK_TYPES,
} from '../../../../domain/src';

export const BASE_CLASS = 'adyen-pe-payment-links-overview';
export const BASE_DETAILS_CLASS = 'adyen-pe-payment-link-details';
export const BASE_TABLE_GRID_CLASS = 'adyen-pe-payment-link-table';
export const BASE_XS_CLASS = `${BASE_CLASS}--xs`;
export const BASE_ACTIONS_CLASS = `${BASE_CLASS}__actions-container`;
export const TABS_CONTAINER_CLASS = `${BASE_CLASS}__tabs-container`;
export const MOBILE_TABLE_CELL_CLASS = `${BASE_TABLE_GRID_CLASS}__mobile-cell`;
export const MOBILE_AMOUNT_CELL_CLASS = `${BASE_TABLE_GRID_CLASS}__mobile-amount-cell`;
export const MOBILE_EXPIRE_DATE_CELL_CLASS = `${BASE_TABLE_GRID_CLASS}__mobile-expire-date-cell`;
export const FILTERS_CONTAINER_CLASS = `${BASE_CLASS}__filters-container`;
export const ACTION_BUTTONS_CONTAINER_CLASS = `${BASE_CLASS}__action-buttons-container`;
export const FILTERS_ALERT_CONTAINER_CLASS = `${BASE_CLASS}__filters-alert-container`;
export const ACTION_BUTTON_CLASS = `${BASE_CLASS}__action-button`;
export const ACTION_BUTTON_MOBILE_CLASS = `${BASE_CLASS}__action-button--xs`;

export const EARLIEST_PAYMENT_LINK_DATE = EARLIEST_PAYMENT_LINK_DATE_DAYS;

export { DEFAULT_PAYMENT_LINK_STATUS_GROUP, PAYMENT_LINK_STATUS_GROUPS_FILTER_MAPPING, PAYMENT_LINK_STATUSES, PAYMENT_LINK_TYPES };

export const PAYMENT_LINK_STATUS_GROUPS_TABS = Object.entries(PAYMENT_LINK_STATUS_GROUPS).map(([statusGroup, labelTranslationKey]) => ({
    id: statusGroup as IPaymentLinkStatusGroup,
    label: labelTranslationKey,
    content: null,
})) satisfies TabComponentProps<IPaymentLinkStatusGroup>['tabs'];

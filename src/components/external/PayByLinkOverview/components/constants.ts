import { TranslationKey } from '../../../../translations';
import { IPayByLinkFilterStatusGroup, IPayByLinkStatus, IPayByLinkStatusGroup, IPayByLinkType } from '../../../../types';
import { TabComponentProps } from '../../../internal/Tabs/types';

export const BASE_CLASS = 'adyen-pe-pay-by-link-overview';
export const BASE_DETAILS_CLASS = 'adyen-pe-pay-by-link-details';
export const BASE_TABLE_GRID_CLASS = 'adyen-pe-pay-by-link-table';
export const BASE_XS_CLASS = `${BASE_CLASS}--xs`;
export const TABS_CONTAINER_CLASS = `${BASE_CLASS}__tabs-container`;
export const FILTERS_CONTAINER_CLASS = `${BASE_CLASS}__filters-container`;
export const ACTION_BUTTONS_CONTAINER_CLASS = `${BASE_CLASS}__action-buttons-container`;
export const ACTION_BUTTON_CLASS = `${BASE_CLASS}__action-button`;

export const EARLIEST_PAYMENT_LINK_DATE = 90;

export const DEFAULT_PAY_BY_LINK_STATUS_GROUP: IPayByLinkStatusGroup = 'active';

export const PAY_BY_LINK_STATUS_GROUPS = {
    active: 'payByLink.overview.list.statusGroups.active',
    inactive: 'payByLink.overview.list.statusGroups.inactive',
} satisfies Record<keyof IPayByLinkFilterStatusGroup, TranslationKey>;

export const PAY_BY_LINK_STATUS_GROUPS_TABS = Object.entries(PAY_BY_LINK_STATUS_GROUPS).map(([statusGroup, labelTranslationKey]) => ({
    id: statusGroup as IPayByLinkStatusGroup,
    label: labelTranslationKey,
    content: null,
})) satisfies TabComponentProps<IPayByLinkStatusGroup>['tabs'];

export const PAY_BY_LINK_STATUS_GROUPS_FILTER_MAPPING = {
    active: 'active',
    inactive: 'inactive',
} as const satisfies Record<IPayByLinkStatusGroup, keyof IPayByLinkFilterStatusGroup>;

export const PAY_BY_LINK_STATUSES = {
    active: 'payByLink.common.status.active',
    expired: 'payByLink.common.status.expired',
    completed: 'payByLink.common.status.completed',
    paymentPending: 'payByLink.common.status.paymentPending',
} as const satisfies Record<IPayByLinkStatus, TranslationKey>;

export const PAY_BY_LINK_TYPES = {
    open: 'payByLink.common.linkType.open',
    singleUse: 'payByLink.common.linkType.singleUse',
} as const satisfies Record<IPayByLinkType, TranslationKey>;

import type { TranslationKey } from '@integration-components/core';
import type { IPaymentLinkFilterStatusGroup, IPaymentLinkStatus, IPaymentLinkStatusGroup, IPaymentLinkType } from '@integration-components/types';

export const EARLIEST_PAYMENT_LINK_DATE_DAYS = 90;

export const DEFAULT_PAYMENT_LINK_STATUS_GROUP: IPaymentLinkStatusGroup = 'active';

export const PAYMENT_LINK_STATUS_GROUPS = {
    active: 'payByLink.overview.list.statusGroups.active',
    inactive: 'payByLink.overview.list.statusGroups.inactive',
} satisfies Record<keyof IPaymentLinkFilterStatusGroup, TranslationKey>;

export const PAYMENT_LINK_STATUS_GROUPS_TABS = Object.entries(PAYMENT_LINK_STATUS_GROUPS).map(([statusGroup, label]) => ({
    id: statusGroup as IPaymentLinkStatusGroup,
    label,
})) satisfies { id: IPaymentLinkStatusGroup; label: TranslationKey }[];

export const PAYMENT_LINK_STATUS_GROUPS_FILTER_MAPPING = {
    active: 'active',
    inactive: 'inactive',
} as const satisfies Record<IPaymentLinkStatusGroup, keyof IPaymentLinkFilterStatusGroup>;

export const PAYMENT_LINK_STATUSES = {
    active: 'payByLink.common.status.active',
    expired: 'payByLink.common.status.expired',
    completed: 'payByLink.common.status.completed',
    paymentPending: 'payByLink.common.status.paymentPending',
} as const satisfies Record<IPaymentLinkStatus, TranslationKey>;

export const PAYMENT_LINK_TYPES = {
    open: 'payByLink.common.linkType.open',
    singleUse: 'payByLink.common.linkType.singleUse',
} as const satisfies Record<IPaymentLinkType, TranslationKey>;

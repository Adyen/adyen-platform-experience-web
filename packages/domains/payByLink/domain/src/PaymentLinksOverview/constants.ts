import type { PayByLinkTranslationKey } from '../shared/types';
import type { IPaymentLinkFilterStatusGroup, IPaymentLinkStatus, IPaymentLinkStatusGroup, IPaymentLinkType } from '@integration-components/types';

export const EARLIEST_PAYMENT_LINK_DATE_DAYS = 90;

export const DEFAULT_PAYMENT_LINK_STATUS_GROUP: IPaymentLinkStatusGroup = 'active';

export const PAYMENT_LINK_STATUS_GROUPS = {
    active: 'payByLink.overview.list.statusGroups.active',
    inactive: 'payByLink.overview.list.statusGroups.inactive',
} satisfies Record<keyof IPaymentLinkFilterStatusGroup, PayByLinkTranslationKey>;

export const PAYMENT_LINK_STATUS_GROUPS_TABS = Object.entries(PAYMENT_LINK_STATUS_GROUPS).map(([statusGroup, label]) => ({
    id: statusGroup as IPaymentLinkStatusGroup,
    label,
})) satisfies { id: IPaymentLinkStatusGroup; label: PayByLinkTranslationKey }[];

export const PAYMENT_LINK_STATUS_GROUPS_FILTER_MAPPING = {
    active: 'active',
    inactive: 'inactive',
} as const satisfies Record<IPaymentLinkStatusGroup, keyof IPaymentLinkFilterStatusGroup>;

export const PAYMENT_LINK_STATUSES = {
    active: 'payByLink.common.statuses.active',
    expired: 'payByLink.common.statuses.expired',
    completed: 'payByLink.common.statuses.completed',
    paymentPending: 'payByLink.common.statuses.paymentPending',
} as const satisfies Record<IPaymentLinkStatus, PayByLinkTranslationKey>;

export const PAYMENT_LINK_TYPES = {
    open: 'payByLink.common.linkType.open',
    singleUse: 'payByLink.common.linkType.singleUse',
} as const satisfies Record<IPaymentLinkType, PayByLinkTranslationKey>;

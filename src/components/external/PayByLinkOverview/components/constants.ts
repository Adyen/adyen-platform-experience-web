import { TranslationKey } from '../../../../translations';
import { IPayByLinkStatus, IPayByLinkStatusGroup, IPayByLinkType } from '../../../../types';

export const BASE_CLASS = 'adyen-pe-pay-by-link-overview-container';
export const BASE_DETAILS_CLASS = 'adyen-pe-pay-by-link-details';
export const BASE_TABLE_GRID_CLASS = 'adyen-pe-pay-by-link-table';

export const DEFAULT_PAY_BY_LINK_STATUS_GROUP: IPayByLinkStatusGroup = 'ACTIVE';

export const PAY_BY_LINK_STATUSES = {
    ACTIVE: 'payByLink.common.status.ACTIVE',
    EXPIRED: 'payByLink.common.status.EXPIRED',
    COMPLETED: 'payByLink.common.status.COMPLETED',
    PAYMENT_PENDING: 'payByLink.common.status.PAYMENT_PENDING',
} as const satisfies Record<IPayByLinkStatus, TranslationKey>;

export const PAY_BY_LINK_TYPES = {
    open: 'payByLink.common.linkType.open',
    singleUse: 'payByLink.common.linkType.singleUse',
} as const satisfies Record<IPayByLinkType, TranslationKey>;

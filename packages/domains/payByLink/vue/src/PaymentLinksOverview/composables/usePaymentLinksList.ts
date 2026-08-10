import { computed } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { useCursorPaginatedRecords } from '@integration-components/composables-vue/useCursorPaginatedRecords';
import { isFunction, listFrom } from '@integration-components/utils';
import type { IPaymentLinkItem, IPaymentLinkStatusGroup } from '@integration-components/types';
import type { StoreIds } from '../../../../domain/src';
import type { PaymentLinksOverviewExternalProps } from '../types';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../constants';
import { getPaymentLinksErrorMetadata, toError } from '../utils/error';

interface UsePaymentLinksListProps {
    fetchEnabled: boolean;
    statusGroup: IPaymentLinkStatusGroup;
    statuses: string[];
    linkTypes: string[];
    filterStoreIds: string[];
    propStoreIds?: StoreIds;
    merchantReference?: string;
    paymentLinkId?: string;
    createdSince: string;
    createdUntil: string;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    onFiltersChanged?: PaymentLinksOverviewExternalProps['onFiltersChanged'];
    lastRefreshTimestamp: number;
    _storeIds: string;
}

const compareStrings = (first: string, second: string) => first.localeCompare(second);

export function usePaymentLinksList(props: () => UsePaymentLinksListProps) {
    const config = useConfigContext();
    const getPaymentLinks = computed(() => config.endpoints.getPaymentLinks);
    const canFetch = computed(() => isFunction(getPaymentLinks.value) && props().fetchEnabled);

    return useCursorPaginatedRecords<IPaymentLinkItem>({
        getFetchKey: () => {
            if (!canFetch.value) return null;

            const {
                statusGroup,
                statuses,
                linkTypes,
                filterStoreIds,
                propStoreIds,
                merchantReference,
                paymentLinkId,
                createdSince,
                createdUntil,
                lastRefreshTimestamp,
                _storeIds,
            } = props();

            return JSON.stringify({
                statusGroup,
                statuses: [...statuses].sort(compareStrings),
                linkTypes: [...linkTypes].sort(compareStrings),
                storeIds: (filterStoreIds.length ? filterStoreIds : (listFrom(propStoreIds) ?? [])).slice().sort(compareStrings),
                merchantReference,
                paymentLinkId,
                createdSince,
                createdUntil,
                lastRefreshTimestamp,
                _storeIds,
            });
        },
        fetchPage: async ({ cursor, limit, signal }) => {
            const fn = getPaymentLinks.value;
            if (!isFunction(fn)) return { records: undefined };

            const { statusGroup, statuses, linkTypes, filterStoreIds, propStoreIds, merchantReference, paymentLinkId, createdSince, createdUntil } =
                props();
            const effectiveStoreIds = filterStoreIds.length ? filterStoreIds : listFrom(propStoreIds);

            const query: NonNullable<Parameters<NonNullable<typeof config.endpoints.getPaymentLinks>>[1]>['query'] = {
                limit,
                statusGroup,
                createdSince,
                createdUntil,
            };

            if (statuses.length) (query as any).statuses = statuses;
            if (linkTypes.length) (query as any).linkTypes = linkTypes;
            if (effectiveStoreIds?.length) (query as any).storeIds = effectiveStoreIds;
            if (merchantReference) query.merchantReference = merchantReference;
            if (paymentLinkId) query.paymentLinkId = paymentLinkId;
            if (cursor) query.cursor = cursor;

            const json = await fn({ signal }, { query });

            return {
                records: json?.data,
                nextCursor: json?._links?.next?.cursor,
                previousCursor: json?._links?.prev?.cursor,
            };
        },
        preferredLimit: props().preferredLimit ?? DEFAULT_PAGE_LIMIT,
        limitOptions: () => (props().allowLimitSelection !== false ? LIMIT_OPTIONS : undefined),
        onSuccess: () => {
            const { onFiltersChanged, linkTypes, statuses, createdSince, createdUntil, filterStoreIds, merchantReference, paymentLinkId } = props();
            if (isFunction(onFiltersChanged)) {
                onFiltersChanged({
                    linkTypes: linkTypes.length ? linkTypes.join(',') : undefined,
                    statuses: statuses.length ? statuses.join(',') : undefined,
                    createdSince,
                    createdUntil,
                    storeIds: filterStoreIds.length ? filterStoreIds.join(',') : undefined,
                    merchantReference,
                    paymentLinkId,
                });
            }
        },
        onError: reason => {
            const error = toError(reason);
            const { errorCode, invalidFields } = getPaymentLinksErrorMetadata(error);
            if (errorCode === '29_001' && invalidFields?.some(field => field.name === 'paymentLinkId')) {
                return { error, records: [], hasNext: false, hasPrevious: false };
            }
            return { error };
        },
    });
}

export default usePaymentLinksList;

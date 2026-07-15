import { ref, computed, watch, onUnmounted } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { isFunction } from '@integration-components/utils';
import type { IPaymentLinkItem, IPaymentLinkStatusGroup } from '@integration-components/types';
import type { StoreIds } from '../../../../domain/src';
import type { PaymentLinksOverviewExternalProps } from '../types';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../constants';

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
}

const listFrom = (value?: StoreIds): string[] | undefined => {
    if (!value) return undefined;
    return typeof value === 'string' ? [value] : value;
};

export function usePaymentLinksList(props: () => UsePaymentLinksListProps) {
    const config = useConfigContext();

    const records = ref<IPaymentLinkItem[] | undefined>(undefined);
    const error = ref<Error | undefined>(undefined);
    const fetching = ref(false);
    const limit = ref(props().preferredLimit ?? DEFAULT_PAGE_LIMIT);
    const cursor = ref<string | undefined>(undefined);
    const prevCursor = ref<string | undefined>(undefined);
    const hasNext = ref(false);
    const hasPrevious = ref(false);
    const page = ref(0);
    const currentRequestCursor = ref<string | undefined>(undefined);

    let abortController: AbortController | null = null;

    const getPaymentLinks = computed(() => config.endpoints.getPaymentLinks);
    const canFetch = computed(() => isFunction(getPaymentLinks.value) && props().fetchEnabled);
    const limitOptions = computed(() => (props().allowLimitSelection !== false ? LIMIT_OPTIONS : undefined));

    async function fetchPaymentLinks(requestCursor?: string) {
        const fn = getPaymentLinks.value;
        if (!isFunction(fn) || !canFetch.value) return;

        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        fetching.value = true;
        error.value = undefined;
        currentRequestCursor.value = requestCursor;

        try {
            const { statusGroup, statuses, linkTypes, filterStoreIds, propStoreIds, merchantReference, paymentLinkId, createdSince, createdUntil } =
                props();
            const effectiveStoreIds = filterStoreIds.length ? filterStoreIds : listFrom(propStoreIds);

            const query: NonNullable<Parameters<NonNullable<typeof config.endpoints.getPaymentLinks>>[1]>['query'] = {
                limit: limit.value,
                statusGroup,
                createdSince,
                createdUntil,
            };
            if (statuses.length) (query as any).statuses = statuses;
            if (linkTypes.length) (query as any).linkTypes = linkTypes;
            if (effectiveStoreIds?.length) (query as any).storeIds = effectiveStoreIds;
            if (merchantReference) query.merchantReference = merchantReference;
            if (paymentLinkId) query.paymentLinkId = paymentLinkId;
            if (requestCursor) query.cursor = requestCursor;

            const json = await fn({ signal }, { query });
            if (!signal.aborted) {
                records.value = json?.data;
                hasNext.value = !!json?._links?.next?.cursor;
                hasPrevious.value = !!json?._links?.prev?.cursor;
                cursor.value = json?._links?.next?.cursor;
                prevCursor.value = json?._links?.prev?.cursor;

                const { onFiltersChanged } = props();
                if (isFunction(onFiltersChanged)) {
                    onFiltersChanged({
                        linkTypes: linkTypes.length ? linkTypes.join(',') : undefined,
                        statuses: statuses.length ? statuses.join(',') : undefined,
                        createdSince,
                        createdUntil,
                        storeIds: effectiveStoreIds?.length ? effectiveStoreIds.join(',') : undefined,
                        merchantReference,
                        paymentLinkId,
                    });
                }
            }
        } catch (e) {
            if (!signal.aborted) {
                error.value = e as Error;

                // Backend returns a validation error (rather than an empty list) when the paymentLinkId
                // filter doesn't match any link. Treat it as an empty result, mirroring the Preact behavior.
                const apiError = e as { errorCode?: string; invalidFields?: { name: string }[] };
                if (apiError.errorCode === '29_001' && apiError.invalidFields?.some(field => field.name === 'paymentLinkId')) {
                    records.value = [];
                    hasNext.value = false;
                    hasPrevious.value = false;
                }
            }
        } finally {
            if (!signal.aborted) {
                fetching.value = false;
            }
        }
    }

    const goToNextPage = () => {
        if (hasNext.value && cursor.value) {
            page.value++;
            fetchPaymentLinks(cursor.value);
        }
    };

    const goToPreviousPage = () => {
        if (hasPrevious.value && prevCursor.value) {
            page.value--;
            fetchPaymentLinks(prevCursor.value);
        }
    };

    const updateLimit = (newLimit: number) => {
        limit.value = newLimit;
        page.value = 0;
        cursor.value = undefined;
        prevCursor.value = undefined;
    };

    const refresh = () => {
        fetchPaymentLinks(currentRequestCursor.value);
    };

    const fetchKey = computed(() => {
        if (!canFetch.value) return null;
        const { statusGroup, statuses, linkTypes, filterStoreIds, propStoreIds, merchantReference, paymentLinkId, createdSince, createdUntil } =
            props();
        return JSON.stringify({
            statusGroup,
            statuses: [...(statuses || [])].sort(),
            linkTypes: [...(linkTypes || [])].sort(),
            storeIds: (filterStoreIds.length ? filterStoreIds : (listFrom(propStoreIds) ?? [])).slice().sort(),
            merchantReference,
            paymentLinkId,
            createdSince,
            createdUntil,
            limit: limit.value,
        });
    });

    watch(
        fetchKey,
        (newKey, oldKey) => {
            if (!newKey) return;
            if (oldKey !== null && oldKey !== undefined) {
                page.value = 0;
                cursor.value = undefined;
                prevCursor.value = undefined;
            }
            fetchPaymentLinks();
        },
        { immediate: true }
    );

    onUnmounted(() => abortController?.abort());

    return {
        error,
        fetching,
        records,
        page,
        limit,
        limitOptions,
        hasNext,
        hasPrevious,
        goToNextPage,
        goToPreviousPage,
        updateLimit,
        refresh,
    } as const;
}

export default usePaymentLinksList;

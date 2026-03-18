import { ref, computed, watch } from 'vue';
import { useConfigContext } from '../../../core/ConfigContext';
import type { IReport, ReportsListResponse, CustomDataRetrieved } from '../types';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../constants';

interface UseReportsListProps {
    fetchEnabled: boolean;
    balanceAccountId: string | undefined;
    createdSince: string;
    createdUntil: string;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    onFiltersChanged?: (filters: Record<string, string | undefined>) => any;
    dataCustomization?: {
        list?: {
            fields?: any[];
            onDataRetrieve?: (data: IReport[]) => Promise<CustomDataRetrieved[]> | CustomDataRetrieved[];
        };
    };
}

const isFunction = <T>(value?: T): value is T & ((...args: any[]) => any) => typeof value === 'function';

export function useReportsList(props: () => UseReportsListProps) {
    const { endpoints } = useConfigContext();

    const records = ref<IReport[] | undefined>(undefined);
    const customRecords = ref<IReport[] | undefined>(undefined);
    const loadingCustomRecords = ref(false);
    const error = ref<Error | undefined>(undefined);
    const fetching = ref(false);
    const limit = ref(props().preferredLimit ?? DEFAULT_PAGE_LIMIT);
    const cursor = ref<string | undefined>(undefined);
    const prevCursor = ref<string | undefined>(undefined);
    const hasNext = ref(false);
    const hasPrevious = ref(false);
    const page = ref(0);
    let abortController: AbortController | null = null;
    let isPaginating = false;

    const getReports = computed(() => endpoints.getReports);
    const canFetch = computed(() => isFunction(getReports.value) && props().fetchEnabled);
    const limitOptions = computed(() => (props().allowLimitSelection !== false ? LIMIT_OPTIONS : undefined));

    async function fetchReports(requestCursor?: string) {
        const fn = getReports.value;
        if (!isFunction(fn) || !canFetch.value) return;

        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        fetching.value = true;
        error.value = undefined;

        try {
            const { balanceAccountId, createdSince, createdUntil } = props();
            const query: Record<string, string> = {
                limit: String(limit.value),
                type: 'payout',
                balanceAccountId: balanceAccountId ?? '',
                createdSince,
                createdUntil,
            };
            if (requestCursor) query.cursor = requestCursor;

            const json: ReportsListResponse = await fn({ signal }, { query });
            if (!signal.aborted) {
                records.value = json?.data;
                hasNext.value = !!json?._links?.next?.cursor;
                hasPrevious.value = !!json?._links?.prev?.cursor;
                cursor.value = json?._links?.next?.cursor;
                prevCursor.value = json?._links?.prev?.cursor;

                // Process custom data
                await processCustomData(json?.data);

                // Notify filter changes
                const { onFiltersChanged } = props();
                if (isFunction(onFiltersChanged)) {
                    onFiltersChanged({
                        balanceAccountId,
                        createdSince,
                        createdUntil,
                    });
                }
            }
        } catch (e) {
            if (!signal.aborted) {
                error.value = e as Error;
            }
        } finally {
            if (!signal.aborted) {
                fetching.value = false;
            }
            isPaginating = false;
        }
    }

    async function processCustomData(data: IReport[] | undefined) {
        if (!data) {
            customRecords.value = data;
            return;
        }
        const { dataCustomization } = props();
        const onDataRetrieve = dataCustomization?.list?.onDataRetrieve;
        const fields = dataCustomization?.list?.fields;
        const hasCustomColumn = hasCustomField(fields);

        if (hasCustomColumn && isFunction(onDataRetrieve)) {
            loadingCustomRecords.value = true;
            try {
                const retrievedData = await onDataRetrieve(data);
                if (Array.isArray(retrievedData)) {
                    customRecords.value = mergeRecords(data, retrievedData);
                } else {
                    customRecords.value = data;
                }
            } catch {
                customRecords.value = data;
            } finally {
                loadingCustomRecords.value = false;
            }
        } else {
            customRecords.value = data;
        }
    }

    function hasCustomField(fields?: any[]): boolean {
        if (!Array.isArray(fields)) return false;
        const standardFields = new Set(['createdAt', 'dateAndReportType', 'reportType', 'reportFile']);
        return fields.some(field => {
            const key = typeof field === 'object' ? field?.key?.trim() : undefined;
            return typeof key === 'string' && key && !standardFields.has(key);
        });
    }

    function mergeRecords(original: IReport[], modified: CustomDataRetrieved[]): IReport[] {
        return original.map(record => {
            const match = modified.find(m => (m as any).createdAt === record.createdAt);
            return match ? ({ ...match, ...record } as IReport) : record;
        });
    }

    const goToNextPage = () => {
        if (hasNext.value && cursor.value) {
            isPaginating = true;
            page.value++;
            fetchReports(cursor.value);
        }
    };

    const goToPreviousPage = () => {
        if (hasPrevious.value && prevCursor.value) {
            isPaginating = true;
            page.value--;
            fetchReports(prevCursor.value);
        }
    };

    const updateLimit = (newLimit: number) => {
        limit.value = newLimit;
        page.value = 0;
        cursor.value = undefined;
        prevCursor.value = undefined;
        fetchReports();
    };

    // Stable key that changes when filter params change
    const fetchKey = computed(() => {
        if (!canFetch.value) return null;
        const { balanceAccountId, createdSince, createdUntil } = props();
        return JSON.stringify({ balanceAccountId, createdSince, createdUntil });
    });

    // Single watcher for initial fetch and filter changes
    watch(
        fetchKey,
        (newKey: string | null, oldKey: string | null | undefined) => {
            if (!newKey) return;
            if (isPaginating) return;
            if (oldKey !== null) {
                page.value = 0;
                cursor.value = undefined;
                prevCursor.value = undefined;
            }
            fetchReports();
        },
        { immediate: true }
    );

    return {
        error,
        fetching,
        records,
        customRecords,
        loadingCustomRecords,
        page,
        limit,
        limitOptions,
        hasNext,
        hasPrevious,
        goToNextPage,
        goToPreviousPage,
        updateLimit,
    };
}

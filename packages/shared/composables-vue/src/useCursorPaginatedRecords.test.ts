import { expect, test, vi } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';
import { useCursorPaginatedRecords } from './useCursorPaginatedRecords';

function createDeferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>(resolvePromise => (resolve = resolvePromise));
    return { promise, resolve };
}

test('fetches cursor pages and resets to the first page when filters or limit change', async () => {
    const fetchPage = vi
        .fn()
        .mockResolvedValueOnce({ records: ['first-page'], nextCursor: 'next-cursor' })
        .mockResolvedValueOnce({ records: ['second-page'], previousCursor: 'previous-cursor' })
        .mockResolvedValueOnce({ records: ['filtered-page'] })
        .mockResolvedValueOnce({ records: ['new-limit-page'] });

    const filterKey = ref('initial');
    const scope = effectScope();

    const pagination = scope.run(() =>
        useCursorPaginatedRecords({
            getFetchKey: () => filterKey.value,
            fetchPage,
            preferredLimit: 10,
            limitOptions: () => [10, 25],
        })
    )!;

    await vi.waitFor(() => expect(pagination.records.value).toEqual(['first-page']));

    pagination.goToNextPage();
    await vi.waitFor(() => expect(pagination.records.value).toEqual(['second-page']));

    expect(pagination.page.value).toBe(1);
    expect(fetchPage.mock.calls[1]?.[0]).toMatchObject({ cursor: 'next-cursor', limit: 10 });

    filterKey.value = 'updated';
    await vi.waitFor(() => expect(pagination.records.value).toEqual(['filtered-page']));

    expect(pagination.page.value).toBe(0);
    expect(fetchPage.mock.calls[2]?.[0]?.cursor).toBeUndefined();

    pagination.updateLimit(25);
    await vi.waitFor(() => expect(pagination.records.value).toEqual(['new-limit-page']));

    expect(pagination.limit.value).toBe(25);
    expect(pagination.limitOptions.value).toEqual([10, 25]);
    expect(fetchPage.mock.calls[3]?.[0]).toMatchObject({ cursor: undefined, limit: 25 });

    scope.stop();
});

test('aborts stale fetches and ignores their results', async () => {
    const firstRequest = createDeferred<{ records: string[] }>();
    const secondRequest = createDeferred<{ records: string[] }>();
    const fetchPage = vi.fn().mockReturnValueOnce(firstRequest.promise).mockReturnValueOnce(secondRequest.promise);

    const filterKey = ref('initial');
    const scope = effectScope();

    const pagination = scope.run(() =>
        useCursorPaginatedRecords({
            getFetchKey: () => filterKey.value,
            fetchPage,
            preferredLimit: 10,
        })
    )!;

    await vi.waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(1));

    filterKey.value = 'updated';

    await vi.waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(2));
    expect(fetchPage.mock.calls[0]?.[0]?.signal.aborted).toBe(true);

    firstRequest.resolve({ records: ['stale-page'] });
    secondRequest.resolve({ records: ['updated-page'] });

    await vi.waitFor(() => expect(pagination.records.value).toEqual(['updated-page']));
    await nextTick();
    expect(pagination.fetching.value).toBe(false);

    scope.stop();
});

test('resets stale pagination when fetching is re-enabled', async () => {
    const fetchEnabled = ref(true);

    const fetchPage = vi
        .fn()
        .mockResolvedValueOnce({ records: ['first-page'], nextCursor: 'next-cursor' })
        .mockResolvedValueOnce({ records: ['second-page'], previousCursor: 'previous-cursor' })
        .mockResolvedValueOnce({ records: ['refreshed-first-page'] });

    const scope = effectScope();

    const pagination = scope.run(() =>
        useCursorPaginatedRecords({
            getFetchKey: () => (fetchEnabled.value ? 'enabled' : null),
            fetchPage,
            preferredLimit: 10,
        })
    )!;

    await vi.waitFor(() => expect(pagination.hasNext.value).toBe(true));

    pagination.goToNextPage();
    await vi.waitFor(() => expect(pagination.page.value).toBe(1));

    fetchEnabled.value = false;
    await nextTick();

    fetchEnabled.value = true;
    await vi.waitFor(() => expect(pagination.records.value).toEqual(['refreshed-first-page']));

    expect(pagination.page.value).toBe(0);
    expect(fetchPage.mock.calls[2]?.[0]?.cursor).toBeUndefined();

    scope.stop();
});

import { expect, test, vi } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';
import { useCursorPaginatedRecords } from './useCursorPaginatedRecords';

function createDeferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;

    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });

    return { promise, resolve, reject };
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

test('rolls back an optimistic page change and retries the same cursor when a subsequent page request fails', async () => {
    const failedNextPageRequest = createDeferred<{ records: string[] }>();

    const fetchPage = vi
        .fn()
        .mockResolvedValueOnce({ records: ['first-page'], nextCursor: 'next-cursor' })
        .mockReturnValueOnce(failedNextPageRequest.promise)
        .mockResolvedValueOnce({ records: ['second-page'], previousCursor: 'previous-cursor' });

    const scope = effectScope();

    const pagination = scope.run(() =>
        useCursorPaginatedRecords({
            getFetchKey: () => 'initial',
            fetchPage,
            preferredLimit: 10,
        })
    )!;

    await vi.waitFor(() => expect(pagination.records.value).toEqual(['first-page']));

    pagination.goToNextPage();
    expect(pagination.page.value).toBe(1);

    pagination.goToNextPage();
    expect(pagination.page.value).toBe(1);
    expect(fetchPage).toHaveBeenCalledTimes(2);

    failedNextPageRequest.reject(new Error('Failed to fetch next page'));
    await vi.waitFor(() => expect(pagination.error.value?.message).toBe('Failed to fetch next page'));

    expect(pagination.page.value).toBe(0);
    expect(pagination.records.value).toEqual(['first-page']);

    pagination.goToNextPage();
    await vi.waitFor(() => expect(pagination.records.value).toEqual(['second-page']));

    expect(pagination.page.value).toBe(1);
    expect(fetchPage.mock.calls.slice(1).map(([request]) => request.cursor)).toEqual(['next-cursor', 'next-cursor']);

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

test('aborts an in-flight fetch when fetching is disabled', async () => {
    const request = createDeferred<{ records: string[] }>();
    const fetchPage = vi.fn().mockReturnValue(request.promise);
    const fetchEnabled = ref(true);
    const scope = effectScope();

    const pagination = scope.run(() =>
        useCursorPaginatedRecords({
            getFetchKey: () => (fetchEnabled.value ? 'enabled' : null),
            fetchPage,
            preferredLimit: 10,
        })
    )!;

    await vi.waitFor(() => expect(fetchPage).toHaveBeenCalledOnce());
    const signal = fetchPage.mock.calls[0]?.[0]?.signal;

    fetchEnabled.value = false;
    await nextTick();

    expect(signal?.aborted).toBe(true);
    expect(pagination.fetching.value).toBe(false);

    request.resolve({ records: ['stale-page'] });
    await nextTick();
    expect(pagination.records.value).toBeUndefined();

    scope.stop();
});

test('preserves cached pagination when fetching is re-enabled with an unchanged key', async () => {
    const fetchEnabled = ref(true);

    const fetchPage = vi
        .fn()
        .mockResolvedValueOnce({ records: ['first-page'], nextCursor: 'next-cursor' })
        .mockResolvedValueOnce({ records: ['second-page'], previousCursor: 'previous-cursor' });

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
    await nextTick();

    expect(pagination.records.value).toEqual(['second-page']);
    expect(pagination.page.value).toBe(1);
    expect(fetchPage).toHaveBeenCalledTimes(2);

    scope.stop();
});

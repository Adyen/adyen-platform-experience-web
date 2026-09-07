/**
 * @vitest-environment jsdom
 */
import { expect, test, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/preact';
import useCursorPaginatedRecords from './useCursorPaginatedRecords';

test('resets pagination when filter params change', async () => {
    const initialFilterParams: { status: 'active' | 'inactive' } = Object.freeze({ status: 'active' });
    const updatedFilterParams: { status: 'active' | 'inactive' } = Object.freeze({ status: 'inactive' });
    let recordsSource = 'first';

    const fetchRecords = vi.fn(async ({ cursor }: { cursor?: string } = {}) =>
        recordsSource === 'first'
            ? {
                  data: [{ id: 'first' }],
                  _links: cursor ? {} : { next: { cursor: 'next-page' } },
              }
            : {
                  data: [{ id: 'second' }],
                  _links: {},
              }
    );

    const { result, rerender } = renderHook(
        ({ filterParams }) =>
            useCursorPaginatedRecords<{ id: string }, 'data', string, string>({
                dataField: 'data',
                enabled: true,
                fetchRecords,
                filterParams,
                preferredLimit: 10,
            }),
        { initialProps: { filterParams: initialFilterParams } }
    );

    await waitFor(() => expect(result.current.hasNext).toBe(true));
    await act(async () => result.current.next());
    expect(fetchRecords).toHaveBeenLastCalledWith(expect.objectContaining({ cursor: 'next-page' }), expect.any(AbortSignal));

    fetchRecords.mockClear();
    recordsSource = 'second';
    rerender({ filterParams: updatedFilterParams });

    await waitFor(() => expect(fetchRecords).toHaveBeenCalledOnce());
    expect(fetchRecords).toHaveBeenCalledWith(expect.objectContaining({ cursor: undefined }), expect.any(AbortSignal));
});

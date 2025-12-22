/**
 * @vitest-environment jsdom
 */
import { FilterParam } from '../../../../types';
import { AmountFilter } from './AmountFilter';
import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
    global.IntersectionObserver = vi.fn((callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => ({
        root: options?.root ?? null,
        rootMargin: options?.rootMargin ?? '',
        thresholds: Array.isArray(options?.threshold) ? options.threshold : [options?.threshold ?? 0],
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
        takeRecords: vi.fn(() => []),
    })) as unknown as typeof IntersectionObserver;
});

afterEach(() => {
    cleanup();
});

type AmountFilterState = { [FilterParam.MIN_AMOUNT]: string | undefined; [FilterParam.MAX_AMOUNT]: string | undefined };

test.each([
    ['4.9', '490000'],
    ['5.1', '510000'],
    ['39.59', '3959000'],
    ['9.123', '912300'],
    ['4.5677', '456770'],
    ['39.59987', '3959987'],
])('handles floating point precision correctly when updating filter', async (input, expected) => {
    let filters: AmountFilterState = {
        [FilterParam.MIN_AMOUNT]: undefined,
        [FilterParam.MAX_AMOUNT]: undefined,
    };
    const updateFilters = (filter: any) => {
        filters = filter;
    };
    const { rerender } = render(
        <AmountFilter
            availableCurrencies={['usd']}
            selectedCurrencies={['usd']}
            name={'range'}
            label={'Amount'}
            minAmount={filters[FilterParam.MIN_AMOUNT]}
            maxAmount={filters[FilterParam.MAX_AMOUNT]}
            updateFilters={updateFilters}
            onChange={updateFilters}
        />
    );
    const amountButton = screen.getByRole('button', { name: 'Amount' });
    amountButton.click();

    const inputElement = await screen.findByTestId('minValueFilter');
    await userEvent.type(inputElement, input);

    const applyButton = await screen.findByLabelText('Apply');
    applyButton.click();

    rerender(
        <AmountFilter
            availableCurrencies={['usd']}
            selectedCurrencies={['usd']}
            name={'range'}
            label={'Amount'}
            minAmount={filters[FilterParam.MIN_AMOUNT]}
            maxAmount={filters[FilterParam.MAX_AMOUNT]}
            updateFilters={updateFilters}
            onChange={updateFilters}
        />
    );

    expect(filters[FilterParam.MIN_AMOUNT]).toBe(expected);
});

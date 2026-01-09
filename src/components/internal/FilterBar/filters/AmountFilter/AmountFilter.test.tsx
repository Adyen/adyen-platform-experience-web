/**
 * @vitest-environment jsdom
 */
import { FilterParam } from '../../../../types';
import { AmountFilter } from './AmountFilter';
import { expect, test } from 'vitest';
import { render, screen, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

type AmountFilterState = { [FilterParam.MIN_AMOUNT]: string | undefined; [FilterParam.MAX_AMOUNT]: string | undefined };

test.sequential.each([
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
    const { rerender, container } = render(
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
    const scope = within(container as HTMLElement);
    const amountButton = scope.getByRole('button', { name: 'Amount' });
    amountButton.click();

    // Popover content is rendered in a portal outside container, so use screen
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

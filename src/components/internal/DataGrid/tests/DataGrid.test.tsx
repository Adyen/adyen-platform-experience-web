/**
 * @vitest-environment jsdom
 */
import { render, screen, within } from '@testing-library/preact';
import { describe, test, expect, vi } from 'vitest';
import { TRANSACTIONS } from '../../../../../mocks/mock-data';
import userEvent from '@testing-library/user-event';
import DataGrid from '../../DataGrid';

const columns = [
    {
        key: 'createdAt',
        label: 'Date',
    },
    {
        key: 'status',
        label: 'Status',
    },
    {
        key: 'paymentMethod',
        label: 'Type',
    },
] satisfies { key: keyof Partial<(typeof TRANSACTIONS)[number]>; label: string }[];

describe('DataGrid component with clickable rows', () => {
    const renderDataGrid = () => {
        const mockEventHandler = vi.fn();
        const mockHover = vi.fn();

        render(
            <div>
                <DataGrid
                    data={TRANSACTIONS}
                    columns={columns}
                    loading={false}
                    onRowClick={{ callback: mockEventHandler, retrievedField: 'id' }}
                    onRowHover={mockHover}
                    customCells={{
                        paymentMethod: ({ item }) => {
                            return (
                                // Add this interactive element to test every possible keyboard interaction (left arrow or tab+shift to get focus back on the row)
                                <span tabIndex={0} role={'button'}>
                                    {item.paymentMethod?.type}
                                </span>
                            );
                        },
                    }}
                />
            </div>
        );

        const table = screen.getByRole('table');
        const user = userEvent.setup();

        const getRow = (index = 0) => {
            return within(within(table).getAllByRole('rowgroup')[1]!).getAllByRole('row')[index];
        };

        return { mockEventHandler, user, getRow };
    };

    test('The rows are focusable', async () => {
        const { getRow, user } = renderDataGrid();
        const firstRow = getRow(0);

        expect(document.body).toHaveFocus();

        await user.tab();

        expect(firstRow).toHaveFocus();
    });

    test('The list is traversed with the keyboard arrows', async () => {
        const { getRow, user } = renderDataGrid();
        const secondRow = getRow(1)!;
        const thirdRow = getRow(2)!;

        await user.tab();

        await user.keyboard('[ArrowDown]');
        expect(secondRow).toHaveFocus();

        await user.keyboard('[ArrowDown]');
        expect(thirdRow).toHaveFocus();

        await user.keyboard('[ArrowUp]');
        expect(secondRow).toHaveFocus();

        const buttonWithinRow = within(secondRow).getByRole('button');
        await user.tab();
        expect(buttonWithinRow).toHaveFocus();

        await user.keyboard('[ArrowLeft]');
        expect(secondRow).toHaveFocus();

        await user.tab();
        expect(buttonWithinRow).toHaveFocus();
        await user.tab({ shift: true });
        expect(secondRow).toHaveFocus();
    });

    test('The click event is triggered with the ENTER key', async () => {
        const { user, mockEventHandler } = renderDataGrid();
        await user.tab();

        await user.keyboard('[Enter]');
        expect(mockEventHandler).toHaveBeenCalled();
    });
});

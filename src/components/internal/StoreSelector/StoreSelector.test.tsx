/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/preact';
import { beforeEach, describe, test, expect, vi } from 'vitest';
import { StoreSelector } from './StoreSelector';
import { STORES } from '../../../../mocks/mock-data';

const mockStores = STORES.map(({ storeCode, description }: { storeCode: string; description: string }) => ({
    id: storeCode,
    name: storeCode,
    storeCode,
    description,
}));

describe('StoreSelector', () => {
    const mockSetSelectedStoreId = vi.fn();

    beforeEach(() => {
        mockSetSelectedStoreId.mockClear();
    });

    test('should render null when stores array is empty', () => {
        const { container } = render(<StoreSelector stores={[]} selectedStoreId={undefined} setSelectedStoreId={mockSetSelectedStoreId} />);
        expect(container.firstChild).toBeNull();
    });

    test('should not render a button when there is only one store', () => {
        render(<StoreSelector stores={mockStores.slice(0, 1)} selectedStoreId={mockStores[0]?.id} setSelectedStoreId={mockSetSelectedStoreId} />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('should render Select component when there are multiple stores', () => {
        render(<StoreSelector stores={mockStores} selectedStoreId={mockStores[0]?.id} setSelectedStoreId={mockSetSelectedStoreId} />);

        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('should render with correct props passed to Select component', () => {
        render(<StoreSelector stores={mockStores} selectedStoreId={mockStores[1]?.id} setSelectedStoreId={mockSetSelectedStoreId} />);

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();

        expect(button).toHaveTextContent('LN001');
        expect(button).toHaveTextContent('Main Store - London');
    });

    test('should render button content correctly when data.item exists', () => {
        render(<StoreSelector stores={mockStores} selectedStoreId={mockStores[0]?.id} setSelectedStoreId={mockSetSelectedStoreId} />);

        expect(screen.getByText('NY001')).toBeInTheDocument();
        expect(screen.getByText('Main Store - New York')).toBeInTheDocument();
    });
});

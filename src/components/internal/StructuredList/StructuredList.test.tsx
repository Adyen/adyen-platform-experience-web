/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/preact';
import { describe, test, expect, vi } from 'vitest';
import { ComponentChild } from 'preact';
import StructuredList, { StructuredListLayouts } from './StructuredList';
import { StructuredListItem } from './types';
import { TranslationKey } from '../../../translations';
import { TypographyVariant } from '../Typography/types';

// Test constants
const MOCK_STRUCTURED_LIST_LABEL = 'Structured List';
const MOCK_VALUE_LABEL = 'value';
const MOCK_LABEL_TEXT = 'Test Label';
const MOCK_VALUE_TEXT = 'Test Value';
const MOCK_CUSTOM_CLASS = 'custom-class';

// Mock dependencies
vi.mock('../../../core/Context/useCoreContext', () => ({
    default: () => ({
        i18n: {
            get: vi.fn((key: string) => {
                const translations: Record<string, string> = {
                    structuredList: MOCK_STRUCTURED_LIST_LABEL,
                    value: MOCK_VALUE_LABEL,
                    testKey: MOCK_LABEL_TEXT,
                };
                return translations[key] || key;
            }),
        },
    }),
}));

vi.mock('./useStructuredListItem', () => ({
    useStructuredListItems: vi.fn((items: StructuredListItem[]) =>
        items.map((item, index) => ({
            key: item.key,
            value: item.value,
            id: `mock-id-${index}`,
            label: MOCK_LABEL_TEXT,
            type: item.type,
            config: item.config,
        }))
    ),
}));

vi.mock('../Typography/Typography', () => ({
    default: ({ children, variant }: { children: ComponentChild; variant: TypographyVariant }) => (
        <span data-testid={`typography-${variant}`}>{children}</span>
    ),
}));

describe('StructuredList component', () => {
    const mockItems: StructuredListItem[] = [
        {
            key: 'testKey' as TranslationKey,
            value: MOCK_VALUE_TEXT,
            type: 'text',
        },
    ];

    describe('Basic Rendering', () => {
        test('renders definition list with correct ARIA label', () => {
            render(<StructuredList items={mockItems} />);

            const definitionList = screen.getByLabelText(MOCK_STRUCTURED_LIST_LABEL);
            expect(definitionList).toBeInTheDocument();
            expect(definitionList.tagName).toBe('DL');
        });

        test('renders items with correct structure', () => {
            render(<StructuredList items={mockItems} />);

            const terms = screen.getAllByRole('term');
            const definitions = screen.getAllByRole('definition');

            expect(terms).toHaveLength(1);
            expect(definitions).toHaveLength(1);
        });

        test('renders with default layout (6-6)', () => {
            render(<StructuredList items={mockItems} />);

            const term = screen.getByRole('term');
            const definition = screen.getByRole('definition');

            expect(term).toHaveClass('adyen-pe-structured-list__grid--width-6-of-12');
            expect(definition).toHaveClass('adyen-pe-structured-list__grid--width-6-of-12');
        });

        test('renders Typography components with BODY variant by default', () => {
            render(<StructuredList items={mockItems} />);

            const typographyElements = screen.getAllByTestId('typography-body');
            expect(typographyElements).toHaveLength(2); // One for label, one for value
        });
    });

    describe('Layout Variants', () => {
        test.each(StructuredListLayouts)('renders with layout %s', layout => {
            render(<StructuredList items={mockItems} layout={layout} />);

            const [labelWidth, valueWidth] = layout.split('-');
            const term = screen.getByRole('term');
            const definition = screen.getByRole('definition');

            expect(term).toHaveClass(`adyen-pe-structured-list__grid--width-${labelWidth}-of-12`);
            expect(definition).toHaveClass(`adyen-pe-structured-list__grid--width-${valueWidth}-of-12`);
        });
    });

    describe('Conditional Props', () => {
        test('renders with highlightable behavior when highlightable is true', () => {
            render(<StructuredList items={mockItems} highlightable />);

            // Test that the component renders successfully with highlightable prop
            // The actual hover behavior would be tested in integration/E2E tests
            const terms = screen.getAllByRole('term');
            const definitions = screen.getAllByRole('definition');

            expect(terms).toHaveLength(1);
            expect(definitions).toHaveLength(1);
        });

        test('renders without highlightable behavior when highlightable is false', () => {
            render(<StructuredList items={mockItems} highlightable={false} />);

            // Test that the component renders successfully without highlightable prop
            const terms = screen.getAllByRole('term');
            const definitions = screen.getAllByRole('definition');

            expect(terms).toHaveLength(1);
            expect(definitions).toHaveLength(1);
        });

        test('renders with grid layout by default', () => {
            render(<StructuredList items={mockItems} />);

            // Test that grid layout is applied by checking column classes on accessible elements
            const term = screen.getByRole('term');
            const definition = screen.getByRole('definition');

            expect(term).toHaveClass('adyen-pe-structured-list__grid--width-6-of-12');
            expect(definition).toHaveClass('adyen-pe-structured-list__grid--width-6-of-12');
        });

        test('renders without grid layout when grid is false', () => {
            render(<StructuredList items={mockItems} grid={false} />);

            // When grid is false, the column width classes should still be applied to dt/dd
            // but the wrapper div won't have the grid class (which we can't test without container)
            const terms = screen.getAllByRole('term');
            const definitions = screen.getAllByRole('definition');

            expect(terms).toHaveLength(1);
            expect(definitions).toHaveLength(1);
        });

        test('applies align-end class when align is end (default)', () => {
            render(<StructuredList items={mockItems} />);

            const definitionList = screen.getByLabelText(MOCK_STRUCTURED_LIST_LABEL);
            expect(definitionList).toHaveClass('adyen-pe-structured-list--align-end');
        });

        test('does not apply align-end class when align is start', () => {
            render(<StructuredList items={mockItems} align="start" />);

            const definitionList = screen.getByLabelText(MOCK_STRUCTURED_LIST_LABEL);
            expect(definitionList).not.toHaveClass('adyen-pe-structured-list--align-end');
        });

        test('applies custom classNames', () => {
            render(<StructuredList items={mockItems} classNames={MOCK_CUSTOM_CLASS} />);

            const definitionList = screen.getByLabelText(MOCK_STRUCTURED_LIST_LABEL);
            expect(definitionList).toHaveClass(MOCK_CUSTOM_CLASS);
        });
    });

    describe('Custom Renderers', () => {
        test('uses renderLabel when provided', () => {
            const customLabelText = 'Custom Label';
            const renderLabel = vi.fn(() => <span data-testid="custom-label">{customLabelText}</span>);

            render(<StructuredList items={mockItems} renderLabel={renderLabel} />);

            expect(screen.getByTestId('custom-label')).toBeInTheDocument();
            expect(screen.getByTestId('custom-label')).toHaveTextContent(customLabelText);
            expect(renderLabel).toHaveBeenCalledWith(MOCK_LABEL_TEXT, mockItems[0]!.key);
        });

        test('uses renderValue when provided', () => {
            const customValueText = 'Custom Value';
            const renderValue = vi.fn(() => <span data-testid="custom-value">{customValueText}</span>);

            render(<StructuredList items={mockItems} renderValue={renderValue} />);

            expect(screen.getByTestId('custom-value')).toBeInTheDocument();
            expect(screen.getByTestId('custom-value')).toHaveTextContent(customValueText);
            expect(renderValue).toHaveBeenCalledWith(MOCK_VALUE_TEXT, mockItems[0]!.key, mockItems[0]!.type, mockItems[0]!.config);
        });

        test('falls back to Typography when custom renderers are not provided', () => {
            render(<StructuredList items={mockItems} />);

            expect(screen.getAllByTestId('typography-body')).toHaveLength(2); // One for label, one for value
        });
    });

    describe('Accessibility', () => {
        test('sets correct ARIA label on definition list', () => {
            render(<StructuredList items={mockItems} />);

            const definitionList = screen.getByLabelText(MOCK_STRUCTURED_LIST_LABEL);
            expect(definitionList).toHaveAttribute('aria-label', MOCK_STRUCTURED_LIST_LABEL);
        });

        test('sets correct ARIA label on definition elements', () => {
            render(<StructuredList items={mockItems} />);

            const definition = screen.getByRole('definition');
            expect(definition).toHaveAttribute('aria-label', `${MOCK_LABEL_TEXT} ${MOCK_VALUE_LABEL}`);
        });

        test('uses semantic HTML structure', () => {
            render(<StructuredList items={mockItems} />);

            const definitionList = screen.getByLabelText(MOCK_STRUCTURED_LIST_LABEL);
            const term = screen.getByRole('term');
            const definition = screen.getByRole('definition');

            expect(definitionList.tagName).toBe('DL');
            expect(term.tagName).toBe('DT');
            expect(definition.tagName).toBe('DD');
        });
    });

    describe('Multiple Items', () => {
        const multipleItems: StructuredListItem[] = [
            {
                key: 'testKey1' as TranslationKey,
                value: 'Value 1',
                type: 'text',
            },
            {
                key: 'testKey2' as TranslationKey,
                value: 'Value 2',
                type: 'link',
                config: { href: 'https://example.com' },
            },
        ];

        test('renders multiple items correctly', () => {
            render(<StructuredList items={multipleItems} />);

            const terms = screen.getAllByRole('term');
            const definitions = screen.getAllByRole('definition');

            expect(terms).toHaveLength(2);
            expect(definitions).toHaveLength(2);
        });

        test('renders items with unique content', () => {
            render(<StructuredList items={multipleItems} />);

            const terms = screen.getAllByRole('term');
            const definitions = screen.getAllByRole('definition');

            // Each item should have its own term and definition
            expect(terms).toHaveLength(2);
            expect(definitions).toHaveLength(2);

            // Verify content is rendered (behavior test, not implementation)
            expect(screen.getByText('Value 1')).toBeInTheDocument();
            expect(screen.getByText('Value 2')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        test('renders with empty items array', () => {
            render(<StructuredList items={[]} />);

            const definitionList = screen.getByLabelText(MOCK_STRUCTURED_LIST_LABEL);
            expect(definitionList).toBeInTheDocument();
            expect(definitionList).toBeEmptyDOMElement();
        });

        test('handles items without optional properties', () => {
            const minimalItems: StructuredListItem[] = [
                {
                    key: 'testKey' as TranslationKey,
                    value: MOCK_VALUE_TEXT,
                },
            ];

            render(<StructuredList items={minimalItems} />);

            const terms = screen.getAllByRole('term');
            const definitions = screen.getAllByRole('definition');

            expect(terms).toHaveLength(1);
            expect(definitions).toHaveLength(1);
        });

        test('handles items with id property', () => {
            const itemsWithId: StructuredListItem[] = [
                {
                    key: 'testKey' as TranslationKey,
                    value: MOCK_VALUE_TEXT,
                    id: 'custom-id',
                },
            ];

            render(<StructuredList items={itemsWithId} />);

            const terms = screen.getAllByRole('term');
            expect(terms).toHaveLength(1);
        });
    });
});

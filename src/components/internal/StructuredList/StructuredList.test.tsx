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

    test('renders semantic HTML structure with correct accessibility', () => {
        render(<StructuredList items={mockItems} />);

        const definitionList = screen.getByLabelText(MOCK_STRUCTURED_LIST_LABEL);
        const term = screen.getByRole('term');
        const definition = screen.getByRole('definition');

        expect(definitionList.tagName).toBe('DL');
        expect(term.tagName).toBe('DT');
        expect(definition.tagName).toBe('DD');
        expect(definition).toHaveAttribute('aria-label', `${MOCK_LABEL_TEXT} ${MOCK_VALUE_LABEL}`);
    });

    test('applies default layout (6-6) correctly', () => {
        render(<StructuredList items={mockItems} />);

        const term = screen.getByRole('term');
        const definition = screen.getByRole('definition');

        expect(term).toHaveClass('adyen-pe-structured-list__grid--width-6-of-12');
        expect(definition).toHaveClass('adyen-pe-structured-list__grid--width-6-of-12');
    });

    test.each(StructuredListLayouts)('applies layout %s correctly', layout => {
        render(<StructuredList items={mockItems} layout={layout} />);

        const [labelWidth, valueWidth] = layout.split('-');
        const term = screen.getByRole('term');
        const definition = screen.getByRole('definition');

        expect(term).toHaveClass(`adyen-pe-structured-list__grid--width-${labelWidth}-of-12`);
        expect(definition).toHaveClass(`adyen-pe-structured-list__grid--width-${valueWidth}-of-12`);
    });

    test('handles alignment and custom classes', () => {
        render(<StructuredList items={mockItems} align="start" classNames={MOCK_CUSTOM_CLASS} />);

        const definitionList = screen.getByLabelText(MOCK_STRUCTURED_LIST_LABEL);
        expect(definitionList).toHaveClass(MOCK_CUSTOM_CLASS);
        expect(definitionList).not.toHaveClass('adyen-pe-structured-list--align-end');
    });

    test('uses custom renderers when provided', () => {
        const customLabelText = 'Custom Label';
        const customValueText = 'Custom Value';
        const renderLabel = vi.fn(() => <span data-testid="custom-label">{customLabelText}</span>);
        const renderValue = vi.fn(() => <span data-testid="custom-value">{customValueText}</span>);

        render(<StructuredList items={mockItems} renderLabel={renderLabel} renderValue={renderValue} />);

        expect(screen.getByTestId('custom-label')).toHaveTextContent(customLabelText);
        expect(screen.getByTestId('custom-value')).toHaveTextContent(customValueText);
        expect(renderLabel).toHaveBeenCalled();
        expect(renderValue).toHaveBeenCalled();
    });

    test('renders multiple items and handles empty state', () => {
        const multipleItems: StructuredListItem[] = [
            { key: 'key1' as TranslationKey, value: 'Value 1' },
            { key: 'key2' as TranslationKey, value: 'Value 2' },
        ];

        const { rerender } = render(<StructuredList items={multipleItems} />);

        expect(screen.getAllByRole('term')).toHaveLength(2);
        expect(screen.getAllByRole('definition')).toHaveLength(2);
        expect(screen.getByText('Value 1')).toBeInTheDocument();
        expect(screen.getByText('Value 2')).toBeInTheDocument();

        // Test empty state
        rerender(<StructuredList items={[]} />);
        const definitionList = screen.getByLabelText(MOCK_STRUCTURED_LIST_LABEL);
        expect(definitionList).toBeEmptyDOMElement();
    });
});

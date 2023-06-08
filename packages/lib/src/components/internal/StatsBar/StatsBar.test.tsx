/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/preact';
import { describe, test, expect } from 'vitest';
import StatsBar from './StatsBar';

describe('StatsBar', () => {
    const items = [
        { label: 'Number', value: 27 },
        { label: 'Element', value: <div>hello</div> },
        { label: 'String', value: 'SomeValue' },
    ];

    test('renders the StatsBar component with correct labels, values and aria labels', () => {
        render(<StatsBar items={items} />);

        const listItems = screen.getAllByRole('listitem');

        expect(listItems).toHaveLength(items.length);

        listItems.forEach((listItem, index) => {
            expect(listItem).toHaveAttribute('aria-label', items[index]?.label);
        });

        expect(listItems[0]).toHaveTextContent('Number');
        expect(listItems[0]).toHaveTextContent('27');

        expect(listItems[1]).toHaveTextContent('Element');
        expect(listItems[1]).toContainHTML('<div>hello</div>');

        expect(listItems[2]).toHaveTextContent('String');
        expect(listItems[2]).toHaveTextContent('SomeValue');
    });
});

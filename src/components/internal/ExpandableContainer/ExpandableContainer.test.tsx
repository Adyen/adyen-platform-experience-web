/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, test } from 'vitest';
import { ExpandableContainer } from './ExpandableContainer';

describe('ExpandableContainer', () => {
    test('should render toggle button with the right attributes', async () => {
        const label = 'Expand content';

        render(<ExpandableContainer aria-label={label}>{'Content'}</ExpandableContainer>);
        const button = screen.getByLabelText(label);

        expect(button).toBeInTheDocument();

        fireEvent.click(button);
        expect(button).toHaveAttribute('aria-label', label);
        expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    test('should toggle content on toggle button click', async () => {
        const contentText = 'Content';
        const label = 'Expand content';

        render(<ExpandableContainer aria-label={label}>{contentText}</ExpandableContainer>);
        const button = screen.getByLabelText(label);
        let content;

        content = screen.queryByText(contentText);
        expect(content).toBeNull();

        fireEvent.click(button);
        content = screen.queryByText(contentText);
        expect(content).toBeInTheDocument();

        fireEvent.click(button);
        content = screen.queryByText(contentText);
        expect(content).toBeNull();
    });
});

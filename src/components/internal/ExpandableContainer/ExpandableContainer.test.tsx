/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, test } from 'vitest';
import { ExpandableContainer } from './ExpandableContainer';

describe('ExpandableContainer', () => {
    test('should render toggle button with the appropriate label', async () => {
        render(<ExpandableContainer>{'Content'}</ExpandableContainer>);
        const button = screen.getByLabelText('Expand');

        expect(button).toBeInTheDocument();

        fireEvent.click(button);
        expect(button).toHaveAttribute('aria-label', 'Collapse');
    });

    test('should toggle content on toggle button click', async () => {
        const contentText = 'Content';
        render(<ExpandableContainer>{contentText}</ExpandableContainer>);

        const button = screen.getByLabelText('Expand');
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

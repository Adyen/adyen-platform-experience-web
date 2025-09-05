/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/preact';
import { beforeEach, describe, expect, test } from 'vitest';
import ExpandableCard from './ExpandableCard';
import { CONTAINER_HIDDEN_CLASS } from './constants';

describe('ExpandableCard component', () => {
    const testExpandBehaviour = async () => {
        const expandButton = screen.getByTestId('expand-button');
        const collapseButton = screen.getByTestId('collapse-button');
        expandButton.click();
        await waitFor(() => {
            expect(collapseButton).not.toHaveClass(CONTAINER_HIDDEN_CLASS);
            expect(collapseButton).toHaveFocus();
        });
        return { expandButton, collapseButton } as const;
    };

    beforeEach(() => {
        render(
            <div>
                <button data-testid="outside-element">{'Click'}</button>
                <ExpandableCard renderContent="Header">{'Body'}</ExpandableCard>
            </div>
        );
    });

    test('should show and focus collapse button when expand button is clicked', async () => {
        await testExpandBehaviour();
    });

    test('should hide collapse button and focus expand button when collapse button is clicked', async () => {
        const { collapseButton, expandButton } = await testExpandBehaviour();
        collapseButton.click();
        await waitFor(() => {
            expect(collapseButton).toHaveClass(CONTAINER_HIDDEN_CLASS);
            expect(expandButton).toHaveFocus();
        });
    });

    test('should hide collapse button and not focus expand button when clicking outside of the collapse button', async () => {
        const outsideElement = screen.getByTestId('outside-element');
        const { collapseButton, expandButton } = await testExpandBehaviour();
        outsideElement.click();
        await waitFor(() => {
            expect(collapseButton).toHaveClass(CONTAINER_HIDDEN_CLASS);
            expect(expandButton).not.toHaveFocus();
        });
    });
});

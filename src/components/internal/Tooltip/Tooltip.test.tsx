/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen, act } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should show tooltip after default delay (500ms)', async () => {
        render(
            <Tooltip content={'Tooltip Content'}>
                <button>{'Hover me'}</button>
            </Tooltip>
        );

        const button = screen.getByText('Hover me');
        fireEvent.mouseEnter(button);

        // Should not be visible immediately
        expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();

        // Advance time by 400ms
        await act(async () => {
            vi.advanceTimersByTime(400);
        });
        expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();

        // Advance time by 100ms (total 500ms)
        await act(async () => {
            vi.advanceTimersByTime(100);
        });
        expect(screen.getByText('Tooltip Content')).toBeInTheDocument();
    });

    it('should show tooltip after custom delay', async () => {
        render(
            <Tooltip content={'Fast Tooltip'} delay={100}>
                <button>{'Hover me fast'}</button>
            </Tooltip>
        );

        const button = screen.getByText('Hover me fast');
        fireEvent.mouseEnter(button);

        // Should not be visible immediately
        expect(screen.queryByText('Fast Tooltip')).not.toBeInTheDocument();

        // Advance time by 50ms
        await act(async () => {
            vi.advanceTimersByTime(50);
        });
        expect(screen.queryByText('Fast Tooltip')).not.toBeInTheDocument();

        // Advance time by 50ms (total 100ms)
        await act(async () => {
            vi.advanceTimersByTime(50);
        });
        expect(screen.getByText('Fast Tooltip')).toBeInTheDocument();
    });

    it('should show tooltip immediately if delay is 0', async () => {
        render(
            <Tooltip content={'Instant Tooltip'} delay={0}>
                <button>{'Hover me instant'}</button>
            </Tooltip>
        );

        const button = screen.getByText('Hover me instant');
        fireEvent.mouseEnter(button);

        // Even with 0, it is a setTimeout(..., 0), so we might need to run pending timers
        await act(async () => {
            vi.advanceTimersByTime(10);
        });

        expect(screen.getByText('Instant Tooltip')).toBeInTheDocument();
    });
});

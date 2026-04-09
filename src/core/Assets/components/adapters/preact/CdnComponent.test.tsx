/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/preact';
import { CdnComponent } from './CdnComponent';
import * as hook from './useCdnComponent';

vi.mock('./useCdnComponent', () => ({
    useCdnComponent: vi.fn(),
}));

const mockedUseCdnComponent = vi.mocked(hook.useCdnComponent) as unknown as ReturnType<typeof vi.fn>;

describe('CdnComponent', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('renders loading slot while loading', () => {
        mockedUseCdnComponent.mockReturnValue({ component: null, loading: true, error: null });
        // @ts-expect-error - Testing with unregistered component
        render(<CdnComponent name="UnregisteredComponent" loading={<span data-testid="loading">{'Loading...'}</span>} />);

        expect(screen.getByTestId('loading')).toBeTruthy();
    });

    test('renders null when loading without a loading slot', () => {
        mockedUseCdnComponent.mockReturnValue({ component: null, loading: true, error: null });
        // @ts-expect-error - Testing with unregistered component
        const { container } = render(<CdnComponent name="UnregisteredComponent" />);

        expect(container.innerHTML).toBe('');
    });

    test('renders error slot when error occurs', () => {
        const err = new Error('Load failed');
        mockedUseCdnComponent.mockReturnValue({ component: null, loading: false, error: err });

        // @ts-expect-error - Testing with unregistered component
        render(<CdnComponent name="UnregisteredComponent" error={e => <span data-testid="error">{e.message}</span>} />);

        expect(screen.getByTestId('error').textContent).toBe('Load failed');
    });

    test('renders null when error without error slot', () => {
        const err = new Error('Load failed');
        mockedUseCdnComponent.mockReturnValue({ component: null, loading: false, error: err });
        // @ts-expect-error - Testing with unregistered component
        const { container } = render(<CdnComponent name="UnregisteredComponent" />);

        expect(container.innerHTML).toBe('');
    });

    test('renders loaded component with props', async () => {
        const TestComponent = ({ greeting }: { greeting: string }) => <span data-testid="component">{greeting}</span>;
        mockedUseCdnComponent.mockReturnValue({ component: TestComponent, loading: false, error: null });

        // @ts-expect-error - Testing with unregistered component
        render(<CdnComponent name="UnregisteredComponent" props={{ greeting: 'Hi' }} />);

        await waitFor(() => {
            expect(screen.getByTestId('component').textContent).toBe('Hi');
        });
    });

    test('renders null when component is null and not loading', () => {
        mockedUseCdnComponent.mockReturnValue({ component: null, loading: false, error: null });
        // @ts-expect-error - Testing with unregistered component
        const { container } = render(<CdnComponent name="UnregisteredComponent" />);

        expect(container.innerHTML).toBe('');
    });

    test('passes component name to useCdnComponent', () => {
        mockedUseCdnComponent.mockReturnValue({ component: null, loading: true, error: null });
        // @ts-expect-error - Testing with unregistered component
        render(<CdnComponent name="UnregisteredComponent" />);

        expect(mockedUseCdnComponent).toHaveBeenCalledWith('UnregisteredComponent');
    });
});

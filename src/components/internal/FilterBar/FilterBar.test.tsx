/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { userEvent } from '@testing-library/user-event';
import { FilterBar, FilterBarMobileSwitch } from './FilterBar';
import { useFilterBarState } from './useFilterBar';

// Mock dependencies
vi.mock('../../../core/Context/useCoreContext', () => ({
    default: () => ({
        i18n: {
            get: vi.fn((key: string) => {
                const translations: Record<string, string> = {
                    filterBar: 'Filter bar',
                    'button.clearAll': 'Clear all',
                };
                return translations[key] || key;
            }),
        },
    }),
}));

vi.mock('../../../hooks/useResponsiveContainer', () => ({
    useResponsiveContainer: vi.fn(),
    containerQueries: {
        down: {
            xs: 'mock-xs-query',
        },
    },
}));

vi.mock('../../../utils', () => ({
    isFunction: vi.fn(fn => typeof fn === 'function'),
}));

// Mock child components
vi.mock('../Button', () => ({
    default: ({ children, onClick, disabled, className, variant, iconButton, ...props }: any) => (
        <button onClick={onClick} disabled={disabled} className={className} data-variant={variant} data-icon-button={iconButton} {...props}>
            {children}
        </button>
    ),
}));

vi.mock('../Icon', () => ({
    default: ({ name }: { name: string }) => <span data-icon={name}>{name}</span>,
}));

import { useResponsiveContainer } from '../../../hooks/useResponsiveContainer';

const mockUseResponsiveContainer = vi.mocked(useResponsiveContainer);

// Test constants to avoid JSX literals
const TEST_LABELS = {
    FILTER_BAR: 'Filter bar',
    CLEAR_ALL: 'Clear all',
    FILTER_ICON: 'filter',
    CROSS_ICON: 'cross',
    BUTTON_ROLE: 'button',
} as const;

const TEST_CONTENT = {
    FILTER_CONTENT: 'Filter content',
    CONTENT: 'Content',
} as const;

const TEST_CLASSES = {
    FILTER_BAR: 'adyen-pe-filter-bar',
    MOBILE_CLASS: 'adyen-pe-filter-bar__content--mobile',
    MOBILE_SWITCH_BUTTON: 'adyen-pe-filter-bar-mobile-switch__button',
} as const;

const TEST_ATTRIBUTES = {
    VARIANT_TERTIARY: 'tertiary',
    VARIANT_SECONDARY: 'secondary',
    ICON_BUTTON_TRUE: 'true',
} as const;

const TEST_IDS = {
    FILTER_CONTENT: 'filter-content',
    CONTENT: 'content',
} as const;

describe('FilterBar Components', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseResponsiveContainer.mockReturnValue(false);
    });

    describe('FilterBar', () => {
        describe('Rendering', () => {
            test('renders filter bar when showingFilters is true', () => {
                render(
                    <FilterBar showingFilters={true}>
                        <div data-testid={TEST_IDS.FILTER_CONTENT}>{TEST_CONTENT.FILTER_CONTENT}</div>
                    </FilterBar>
                );

                const filterBar = screen.getByLabelText(TEST_LABELS.FILTER_BAR);
                const content = screen.getByTestId(TEST_IDS.FILTER_CONTENT);

                expect(filterBar).toBeInTheDocument();
                expect(filterBar).toHaveClass(TEST_CLASSES.FILTER_BAR);
                expect(content).toBeInTheDocument();
            });

            test('does not render when showingFilters is false', () => {
                render(
                    <FilterBar showingFilters={false}>
                        <div data-testid={TEST_IDS.FILTER_CONTENT}>{TEST_CONTENT.FILTER_CONTENT}</div>
                    </FilterBar>
                );

                expect(screen.queryByLabelText(TEST_LABELS.FILTER_BAR)).not.toBeInTheDocument();
                expect(screen.queryByTestId(TEST_IDS.FILTER_CONTENT)).not.toBeInTheDocument();
            });

            test('applies mobile class when isMobileContainer is true', () => {
                render(
                    <FilterBar showingFilters={true} isMobileContainer={true}>
                        <div>{TEST_CONTENT.CONTENT}</div>
                    </FilterBar>
                );

                const filterBar = screen.getByLabelText(TEST_LABELS.FILTER_BAR);
                expect(filterBar).toHaveClass(TEST_CLASSES.MOBILE_CLASS);
            });

            test('does not apply mobile class when isMobileContainer is false', () => {
                render(
                    <FilterBar showingFilters={true} isMobileContainer={false}>
                        <div>{TEST_CONTENT.CONTENT}</div>
                    </FilterBar>
                );

                const filterBar = screen.getByLabelText(TEST_LABELS.FILTER_BAR);
                expect(filterBar).not.toHaveClass(TEST_CLASSES.MOBILE_CLASS);
            });

            test('handles empty children', () => {
                render(<FilterBar showingFilters={true} />);

                const filterBar = screen.getByLabelText(TEST_LABELS.FILTER_BAR);
                expect(filterBar).toBeInTheDocument();
                expect(filterBar).toBeEmptyDOMElement();
            });

            test('handles undefined props gracefully', () => {
                render(
                    <FilterBar>
                        <div data-testid={TEST_IDS.CONTENT}>{TEST_CONTENT.CONTENT}</div>
                    </FilterBar>
                );

                // Should not render when showingFilters is undefined
                expect(screen.queryByTestId(TEST_IDS.CONTENT)).not.toBeInTheDocument();
            });
        });

        describe('Reset filters functionality', () => {
            test('renders reset button when canResetFilters is true and resetFilters is provided', () => {
                const resetFilters = vi.fn();

                render(
                    <FilterBar showingFilters={true} canResetFilters={true} resetFilters={resetFilters}>
                        <div>{TEST_CONTENT.CONTENT}</div>
                    </FilterBar>
                );

                const resetButton = screen.getByRole(TEST_LABELS.BUTTON_ROLE, { name: TEST_LABELS.CLEAR_ALL });
                expect(resetButton).toBeInTheDocument();
                expect(resetButton).toHaveAttribute('data-variant', TEST_ATTRIBUTES.VARIANT_TERTIARY);
            });

            test('does not render reset button when canResetFilters is false', () => {
                const resetFilters = vi.fn();

                render(
                    <FilterBar showingFilters={true} canResetFilters={false} resetFilters={resetFilters}>
                        <div>{TEST_CONTENT.CONTENT}</div>
                    </FilterBar>
                );

                expect(screen.queryByRole(TEST_LABELS.BUTTON_ROLE, { name: TEST_LABELS.CLEAR_ALL })).not.toBeInTheDocument();
            });

            test('does not render reset button when resetFilters is not provided', () => {
                render(
                    <FilterBar showingFilters={true} canResetFilters={true}>
                        <div>{TEST_CONTENT.CONTENT}</div>
                    </FilterBar>
                );

                expect(screen.queryByRole(TEST_LABELS.BUTTON_ROLE, { name: TEST_LABELS.CLEAR_ALL })).not.toBeInTheDocument();
            });

            test('calls resetFilters when reset button is clicked', async () => {
                const resetFilters = vi.fn();
                const user = userEvent.setup();

                render(
                    <FilterBar showingFilters={true} canResetFilters={true} resetFilters={resetFilters}>
                        <div>{TEST_CONTENT.CONTENT}</div>
                    </FilterBar>
                );

                const resetButton = screen.getByRole(TEST_LABELS.BUTTON_ROLE, { name: TEST_LABELS.CLEAR_ALL });
                await user.click(resetButton);

                expect(resetFilters).toHaveBeenCalledOnce();
            });

            test('resetFilters button only renders when both conditions are met', () => {
                // Test with canResetFilters true but no resetFilters function
                render(
                    <FilterBar showingFilters={true} canResetFilters={true}>
                        <div>{TEST_CONTENT.CONTENT}</div>
                    </FilterBar>
                );

                expect(screen.queryByRole(TEST_LABELS.BUTTON_ROLE, { name: TEST_LABELS.CLEAR_ALL })).not.toBeInTheDocument();

                // Test with resetFilters function but canResetFilters false
                const resetFilters = vi.fn();
                render(
                    <FilterBar showingFilters={true} canResetFilters={false} resetFilters={resetFilters}>
                        <div>{TEST_CONTENT.CONTENT}</div>
                    </FilterBar>
                );

                expect(screen.queryByRole(TEST_LABELS.BUTTON_ROLE, { name: TEST_LABELS.CLEAR_ALL })).not.toBeInTheDocument();
            });
        });

        describe('Accessibility', () => {
            test('has correct aria-label', () => {
                render(
                    <FilterBar showingFilters={true}>
                        <div>{TEST_CONTENT.CONTENT}</div>
                    </FilterBar>
                );

                const filterBar = screen.getByLabelText(TEST_LABELS.FILTER_BAR);
                expect(filterBar).toBeInTheDocument();
            });

            test('reset button is keyboard accessible', async () => {
                const resetFilters = vi.fn();
                const user = userEvent.setup();

                render(
                    <FilterBar showingFilters={true} canResetFilters={true} resetFilters={resetFilters}>
                        <div>{TEST_CONTENT.CONTENT}</div>
                    </FilterBar>
                );

                const resetButton = screen.getByRole(TEST_LABELS.BUTTON_ROLE, { name: TEST_LABELS.CLEAR_ALL });

                // Focus the button with keyboard
                await user.tab();
                expect(resetButton).toHaveFocus();

                // Activate with Enter key
                await user.keyboard('{Enter}');
                expect(resetFilters).toHaveBeenCalledOnce();
            });
        });
    });

    describe('FilterBarMobileSwitch', () => {
        describe('Rendering', () => {
            test('renders mobile switch when isMobileContainer is true', () => {
                const setShowingFilters = vi.fn();

                render(<FilterBarMobileSwitch isMobileContainer={true} showingFilters={false} setShowingFilters={setShowingFilters} />);

                const switchContainer = screen.getByRole(TEST_LABELS.BUTTON_ROLE);
                expect(switchContainer).toBeInTheDocument();
                expect(switchContainer).toHaveClass(TEST_CLASSES.MOBILE_SWITCH_BUTTON);
                expect(switchContainer).toHaveAttribute('data-variant', TEST_ATTRIBUTES.VARIANT_SECONDARY);
                expect(switchContainer).toHaveAttribute('data-icon-button', TEST_ATTRIBUTES.ICON_BUTTON_TRUE);
            });

            test('does not render when isMobileContainer is false', () => {
                const setShowingFilters = vi.fn();

                render(<FilterBarMobileSwitch isMobileContainer={false} showingFilters={false} setShowingFilters={setShowingFilters} />);

                expect(screen.queryByRole(TEST_LABELS.BUTTON_ROLE)).not.toBeInTheDocument();
            });
        });

        describe('Icon display', () => {
            test('shows filter icon when showingFilters is false', () => {
                const setShowingFilters = vi.fn();

                render(<FilterBarMobileSwitch isMobileContainer={true} showingFilters={false} setShowingFilters={setShowingFilters} />);

                const filterIcon = screen.getByText(TEST_LABELS.FILTER_ICON);
                expect(filterIcon).toBeInTheDocument();
                expect(filterIcon).toHaveAttribute('data-icon', TEST_LABELS.FILTER_ICON);
            });

            test('shows cross icon when showingFilters is true', () => {
                const setShowingFilters = vi.fn();

                render(<FilterBarMobileSwitch isMobileContainer={true} showingFilters={true} setShowingFilters={setShowingFilters} />);

                const crossIcon = screen.getByText(TEST_LABELS.CROSS_ICON);
                expect(crossIcon).toBeInTheDocument();
                expect(crossIcon).toHaveAttribute('data-icon', TEST_LABELS.CROSS_ICON);
            });
        });

        describe('Interactions', () => {
            test('toggles showingFilters when button is clicked', async () => {
                const setShowingFilters = vi.fn();
                const user = userEvent.setup();

                render(<FilterBarMobileSwitch isMobileContainer={true} showingFilters={false} setShowingFilters={setShowingFilters} />);

                const button = screen.getByRole(TEST_LABELS.BUTTON_ROLE);
                await user.click(button);

                expect(setShowingFilters).toHaveBeenCalledWith(true);
            });

            test('toggles showingFilters from true to false when button is clicked', async () => {
                const setShowingFilters = vi.fn();
                const user = userEvent.setup();

                render(<FilterBarMobileSwitch isMobileContainer={true} showingFilters={true} setShowingFilters={setShowingFilters} />);

                const button = screen.getByRole(TEST_LABELS.BUTTON_ROLE);
                await user.click(button);

                expect(setShowingFilters).toHaveBeenCalledWith(false);
            });

            test('disables button when setShowingFilters is not a function', () => {
                render(<FilterBarMobileSwitch isMobileContainer={true} showingFilters={false} setShowingFilters={null as any} />);

                const button = screen.getByRole(TEST_LABELS.BUTTON_ROLE);
                expect(button).toBeDisabled();
            });

            test('handles undefined setShowingFilters', () => {
                render(<FilterBarMobileSwitch isMobileContainer={true} showingFilters={false} setShowingFilters={undefined as any} />);

                const button = screen.getByRole(TEST_LABELS.BUTTON_ROLE);
                expect(button).toBeDisabled();
            });
        });

        describe('Accessibility', () => {
            test('mobile switch button is keyboard accessible', async () => {
                const setShowingFilters = vi.fn();
                const user = userEvent.setup();

                render(<FilterBarMobileSwitch isMobileContainer={true} showingFilters={false} setShowingFilters={setShowingFilters} />);

                const button = screen.getByRole(TEST_LABELS.BUTTON_ROLE);

                // Focus the button with keyboard
                await user.tab();
                expect(button).toHaveFocus();

                // Activate with Enter key
                await user.keyboard('{Enter}');
                expect(setShowingFilters).toHaveBeenCalledWith(true);

                // Reset mock
                setShowingFilters.mockClear();

                // Activate with Space key
                await user.keyboard(' ');
                expect(setShowingFilters).toHaveBeenCalledWith(true);
            });
        });
    });

    describe('Integration', () => {
        test('FilterBar and FilterBarMobileSwitch work together correctly', async () => {
            const resetFilters = vi.fn();
            const user = userEvent.setup();

            // Start with mobile view
            mockUseResponsiveContainer.mockReturnValue(true);

            const TestComponent = () => {
                const filterBarState = useFilterBarState();
                return (
                    <div>
                        <FilterBarMobileSwitch {...filterBarState} />
                        <FilterBar {...filterBarState} canResetFilters={true} resetFilters={resetFilters}>
                            <div data-testid={TEST_IDS.FILTER_CONTENT}>{TEST_CONTENT.FILTER_CONTENT}</div>
                        </FilterBar>
                    </div>
                );
            };

            render(<TestComponent />);

            // Initially, filters should be hidden in mobile view
            expect(screen.queryByTestId(TEST_IDS.FILTER_CONTENT)).not.toBeInTheDocument();
            expect(screen.getByText(TEST_LABELS.FILTER_ICON)).toBeInTheDocument(); // Filter icon

            // Click mobile switch to show filters
            const mobileButton = screen.getByRole(TEST_LABELS.BUTTON_ROLE);
            await user.click(mobileButton);

            // Now filters should be visible
            expect(screen.getByTestId(TEST_IDS.FILTER_CONTENT)).toBeInTheDocument();
            expect(screen.getByText(TEST_LABELS.CROSS_ICON)).toBeInTheDocument(); // Cross icon
            expect(screen.getByRole(TEST_LABELS.BUTTON_ROLE, { name: TEST_LABELS.CLEAR_ALL })).toBeInTheDocument();

            // Click reset button
            const resetButton = screen.getByRole(TEST_LABELS.BUTTON_ROLE, { name: TEST_LABELS.CLEAR_ALL });
            await user.click(resetButton);
            expect(resetFilters).toHaveBeenCalledOnce();

            // Click mobile switch again to hide filters
            await user.click(mobileButton);
            expect(screen.queryByTestId(TEST_IDS.FILTER_CONTENT)).not.toBeInTheDocument();
        });

        test('responsive behavior changes correctly', () => {
            const TestComponent = () => {
                const filterBarState = useFilterBarState();
                return (
                    <div>
                        <FilterBarMobileSwitch {...filterBarState} />
                        <FilterBar {...filterBarState}>
                            <div data-testid={TEST_IDS.FILTER_CONTENT}>{TEST_CONTENT.FILTER_CONTENT}</div>
                        </FilterBar>
                    </div>
                );
            };

            // Start with desktop view
            mockUseResponsiveContainer.mockReturnValue(false);
            const { rerender } = render(<TestComponent />);

            // Desktop: no mobile switch, filters visible
            expect(screen.queryByRole(TEST_LABELS.BUTTON_ROLE)).not.toBeInTheDocument();
            expect(screen.getByTestId(TEST_IDS.FILTER_CONTENT)).toBeInTheDocument();

            // Switch to mobile view
            mockUseResponsiveContainer.mockReturnValue(true);
            rerender(<TestComponent />);

            // Mobile: mobile switch visible, filters hidden
            expect(screen.getByRole(TEST_LABELS.BUTTON_ROLE)).toBeInTheDocument();
            expect(screen.queryByTestId(TEST_IDS.FILTER_CONTENT)).not.toBeInTheDocument();
        });
    });
});

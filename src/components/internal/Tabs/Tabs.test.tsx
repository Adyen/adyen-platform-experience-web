/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/preact';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import Tabs from './Tabs';
import { TabProps } from './types';
import * as CoreContextModule from '../../../core/Context/useCoreContext';

// Test constants
const TAB_1_ID = 'tab1' as const;
const TAB_2_ID = 'tab2' as const;
const TAB_3_ID = 'tab3' as const;

const LABEL_TAB_1 = 'Tab One';
const LABEL_TAB_2 = 'Tab Two';
const LABEL_TAB_3 = 'Tab Three';

const CONTENT_TAB_1 = 'Content for tab 1';
const CONTENT_TAB_2 = 'Content for tab 2';
const CONTENT_TAB_3 = 'Content for tab 3';

const mockI18n = {
    get: vi.fn((key: string) => key),
    ready: Promise.resolve(),
};

const createTabs = (): TabProps<typeof TAB_1_ID | typeof TAB_2_ID | typeof TAB_3_ID>[] => [
    {
        id: TAB_1_ID,
        label: LABEL_TAB_1 as any,
        content: CONTENT_TAB_1,
    },
    {
        id: TAB_2_ID,
        label: LABEL_TAB_2 as any,
        content: CONTENT_TAB_2,
    },
    {
        id: TAB_3_ID,
        label: LABEL_TAB_3 as any,
        content: CONTENT_TAB_3,
    },
];

describe('Tabs Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(CoreContextModule, 'default').mockReturnValue({
            i18n: mockI18n,
        } as any);
    });

    describe('Rendering', () => {
        test('renders all tabs with correct labels', () => {
            const tabs = createTabs();
            render(<Tabs tabs={tabs} />);

            expect(screen.getByRole('tab', { name: LABEL_TAB_1 })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: LABEL_TAB_2 })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: LABEL_TAB_3 })).toBeInTheDocument();
        });

        test('renders tablist with correct ARIA orientation', () => {
            const tabs = createTabs();
            render(<Tabs tabs={tabs} />);

            const tablist = screen.getByRole('tablist');
            expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');
        });

        test('first tab is active by default', () => {
            const tabs = createTabs();
            render(<Tabs tabs={tabs} />);

            const firstTab = screen.getByRole('tab', { name: LABEL_TAB_1 });
            expect(firstTab).toHaveAttribute('aria-selected', 'true');
        });

        test('shows content for active tab', () => {
            const tabs = createTabs();
            render(<Tabs tabs={tabs} />);

            const panels = screen.getAllByRole('tabpanel', { hidden: true });
            const visiblePanel = panels.find(panel => !panel.hasAttribute('hidden'));

            expect(visiblePanel).toHaveTextContent(CONTENT_TAB_1);
        });
    });

    describe('Tab Selection', () => {
        test('renders specified active tab when activeTab prop provided', () => {
            const tabs = createTabs();
            render(<Tabs tabs={tabs} activeTab={TAB_2_ID} />);

            const secondTab = screen.getByRole('tab', { name: LABEL_TAB_2 });
            expect(secondTab).toHaveAttribute('aria-selected', 'true');

            const panels = screen.getAllByRole('tabpanel', { hidden: true });
            const visiblePanel = panels.find(panel => !panel.hasAttribute('hidden'));
            expect(visiblePanel).toHaveTextContent(CONTENT_TAB_2);
        });

        test('clicking a tab switches to that tab', async () => {
            const tabs = createTabs();
            const user = userEvent.setup();
            render(<Tabs tabs={tabs} />);

            const thirdTab = screen.getByRole('tab', { name: LABEL_TAB_3 });
            await user.click(thirdTab);

            expect(thirdTab).toHaveAttribute('aria-selected', 'true');

            const panels = screen.getAllByRole('tabpanel', { hidden: true });
            const visiblePanel = panels.find(panel => !panel.hasAttribute('hidden'));
            expect(visiblePanel).toHaveTextContent(CONTENT_TAB_3);
        });

        test('updates active tab when activeTab prop changes', () => {
            const tabs = createTabs();
            const { rerender } = render(<Tabs tabs={tabs} activeTab={TAB_1_ID} />);

            const firstTab = screen.getByRole('tab', { name: LABEL_TAB_1 });
            expect(firstTab).toHaveAttribute('aria-selected', 'true');

            rerender(<Tabs tabs={tabs} activeTab={TAB_3_ID} />);

            const thirdTab = screen.getByRole('tab', { name: LABEL_TAB_3 });
            expect(thirdTab).toHaveAttribute('aria-selected', 'true');
            expect(firstTab).toHaveAttribute('aria-selected', 'false');
        });
    });

    describe('Disabled Tabs', () => {
        test('disabled tab has disabled attribute', () => {
            const tabs = createTabs();
            tabs[1].disabled = true;
            render(<Tabs tabs={tabs} />);

            const secondTab = screen.getByRole('tab', { name: LABEL_TAB_2 });
            expect(secondTab).toBeDisabled();
        });

        test('clicking disabled tab does not switch to it', async () => {
            const tabs = createTabs();
            tabs[1].disabled = true;
            const user = userEvent.setup();
            render(<Tabs tabs={tabs} />);

            const secondTab = screen.getByRole('tab', { name: LABEL_TAB_2 });
            await user.click(secondTab);

            expect(secondTab).toHaveAttribute('aria-selected', 'false');

            // First tab should still be active
            const firstTab = screen.getByRole('tab', { name: LABEL_TAB_1 });
            expect(firstTab).toHaveAttribute('aria-selected', 'true');
        });
    });

    describe('Accessibility', () => {
        test('inactive tabs have tabIndex -1', () => {
            const tabs = createTabs();
            render(<Tabs tabs={tabs} activeTab={TAB_2_ID} />);

            const firstTab = screen.getByRole('tab', { name: LABEL_TAB_1 });
            const thirdTab = screen.getByRole('tab', { name: LABEL_TAB_3 });

            expect(firstTab).toHaveAttribute('tabIndex', '-1');
            expect(thirdTab).toHaveAttribute('tabIndex', '-1');
        });

        test('active tab has tabIndex 0', () => {
            const tabs = createTabs();
            render(<Tabs tabs={tabs} activeTab={TAB_2_ID} />);

            const secondTab = screen.getByRole('tab', { name: LABEL_TAB_2 });
            expect(secondTab).toHaveAttribute('tabIndex', '0');
        });

        test('tab controls correct tabpanel via aria-controls', () => {
            const tabs = createTabs();
            render(<Tabs tabs={tabs} />);

            const firstTab = screen.getByRole('tab', { name: LABEL_TAB_1 });
            const ariaControls = firstTab.getAttribute('aria-controls');

            const panels = screen.getAllByRole('tabpanel', { hidden: true });
            const associatedPanel = panels.find(panel => panel.id === ariaControls);

            expect(associatedPanel).toBeDefined();
        });

        test('tabpanel labeled by tab via aria-labelledby', () => {
            const tabs = createTabs();
            render(<Tabs tabs={tabs} />);

            const firstTab = screen.getByRole('tab', { name: LABEL_TAB_1 });
            const tabId = firstTab.id;

            const panels = screen.getAllByRole('tabpanel', { hidden: true });
            const associatedPanel = panels.find(panel => panel.getAttribute('aria-labelledby') === tabId);

            expect(associatedPanel).toBeDefined();
        });
    });
});

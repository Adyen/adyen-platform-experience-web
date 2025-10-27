/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/preact';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useCallback, useState } from 'preact/hooks';
import { TimelineItem } from './TimelineItem';
import { TimelineContext, TimelineContextValue } from '../context';
import useCoreContext from '../../../../core/Context/useCoreContext';

vi.mock('../../../../core/Context/useCoreContext');

const mockI18n = {
    get: vi.fn((key: string, params?: any) => {
        if (key === 'common.timeline.timelineItem.showMoreItems') {
            return `Show ${params?.values?.items} more`;
        }
        if (key === 'common.timeline.timelineItem.showLess') {
            return 'Show less';
        }
        if (key === 'common.timeline.timelineItem.timeGap.unit.day') {
            const value = params?.values?.value || params?.count || 0;
            return value === 1 ? `${value} day` : `${value} days`;
        }
        if (key === 'common.timeline.timelineItem.timeGap.a11y.label') {
            return `Time gap: ${params?.values?.timeGap}`;
        }
        return key;
    }),
    date: vi.fn((date: Date | number) => {
        const d = new Date(date);
        const month = d.toLocaleDateString('en-US', { month: 'short' });
        const day = d.getDate();
        const year = d.getFullYear();
        return `${month} ${day}, ${year}`;
    }),
    has: vi.fn(() => true),
    locale: 'en-US',
    languageCode: 'en',
};

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCoreContext).mockReturnValue({
        i18n: mockI18n,
        updateCore: vi.fn(),
        getImageAsset: vi.fn(),
    } as any);
});

const TITLE = 'Milestone';
const TIMESTAMP_VALUE = 'Timestamp';
const TIMESTAMP_DATE = new Date('01-30-2000 14:00:00');

const DEFAULT_PROPS = {
    title: TITLE,
    timestamp: { date: TIMESTAMP_DATE, value: TIMESTAMP_VALUE },
};

// Helper to create a test wrapper with stateful context
const TestWrapper = ({ children, contextOverrides = {} }: { children: any; contextOverrides?: Partial<TimelineContextValue> }) => {
    const [entries, setEntries] = useState<any[]>([]);

    const registerTimelineEntry = useCallback((entry: any) => {
        setEntries((prev: any[]) => [...prev, entry]);
        return () => {
            setEntries((prev: any[]) => prev.filter((e: any) => e !== entry));
        };
    }, []);

    const context: TimelineContextValue = {
        registerTimelineEntry,
        entries,
        showAll: false,
        showMoreIndex: null,
        hiddenItems: null,
        visibleIndexes: null,
        timeGapLimit: null,
        toggleShowAll: vi.fn(),
        ...contextOverrides,
    };

    return <TimelineContext.Provider value={context}>{children}</TimelineContext.Provider>;
};

describe('TimelineItem', () => {
    describe('should render props correctly', () => {
        test('required props: title and timestamp', () => {
            render(
                <TestWrapper contextOverrides={{ showAll: true }}>
                    <TimelineItem {...DEFAULT_PROPS} />
                </TestWrapper>
            );

            expect(screen.getByText(TITLE)).toBeInTheDocument();
            expect(screen.getByText(/Jan 30, 2000/)).toBeInTheDocument();
            expect(screen.getByText(new RegExp(TIMESTAMP_VALUE))).toBeInTheDocument();
        });

        test('description', () => {
            const DESCRIPTION = 'Description';
            render(
                <TestWrapper contextOverrides={{ showAll: true }}>
                    <TimelineItem {...DEFAULT_PROPS} description={DESCRIPTION} />
                </TestWrapper>
            );

            expect(screen.getByText(TITLE)).toBeInTheDocument();
            expect(screen.getByText(/Jan 30, 2000/)).toBeInTheDocument();
            expect(screen.getByText(new RegExp(TIMESTAMP_VALUE))).toBeInTheDocument();
            expect(screen.getByText(DESCRIPTION)).toBeInTheDocument();
        });

        test('data list', () => {
            const DATA_LIST = [
                { label: 'Label1', value: 'Value1', key: 'common.actions.apply.labels.default' } as const,
                { label: 'Label2', value: 'Value2', key: 'common.actions.apply.labels.default' } as const,
            ];
            render(
                <TestWrapper contextOverrides={{ showAll: true }}>
                    <TimelineItem {...DEFAULT_PROPS} dataList={DATA_LIST} />
                </TestWrapper>
            );

            expect(screen.getByText(TITLE)).toBeInTheDocument();
            expect(screen.getByText(/Jan 30, 2000/)).toBeInTheDocument();
            expect(screen.getByText(new RegExp(TIMESTAMP_VALUE))).toBeInTheDocument();
            // StructuredList renders data list values
            expect(screen.getByText(DATA_LIST[0]!.value)).toBeInTheDocument();
            expect(screen.getByText(DATA_LIST[1]!.value)).toBeInTheDocument();
        });

        test('tag', () => {
            const TAG = { label: 'Tag' };
            render(
                <TestWrapper contextOverrides={{ showAll: true }}>
                    <TimelineItem {...DEFAULT_PROPS} tag={TAG} />
                </TestWrapper>
            );

            expect(screen.getByText(TITLE)).toBeInTheDocument();
            expect(screen.getByText(/Jan 30, 2000/)).toBeInTheDocument();
            expect(screen.getByText(new RegExp(TIMESTAMP_VALUE))).toBeInTheDocument();
            expect(screen.getByText(TAG.label)).toBeInTheDocument();
        });
    });

    describe('should render show more correctly', () => {
        test('shows if show more index is the same as index and has number of hidden items', () => {
            render(
                <TestWrapper contextOverrides={{ showAll: false, showMoreIndex: 0, hiddenItems: 2, visibleIndexes: [0] }}>
                    <TimelineItem {...DEFAULT_PROPS} />
                </TestWrapper>
            );

            expect(screen.getByText(TITLE)).toBeInTheDocument();
            expect(screen.getByText(/Jan 30, 2000/)).toBeInTheDocument();
            expect(screen.getByText(new RegExp(TIMESTAMP_VALUE))).toBeInTheDocument();
            expect(screen.getByText('Show 2 more')).toBeInTheDocument();
        });

        test('button has show less if show all is true', () => {
            render(
                <TestWrapper contextOverrides={{ showAll: true, showMoreIndex: 0, hiddenItems: 2 }}>
                    <TimelineItem {...DEFAULT_PROPS} />
                </TestWrapper>
            );

            expect(screen.getByText(TITLE)).toBeInTheDocument();
            expect(screen.getByText(/Jan 30, 2000/)).toBeInTheDocument();
            expect(screen.getByText(new RegExp(TIMESTAMP_VALUE))).toBeInTheDocument();
            expect(screen.getByText('Show less')).toBeInTheDocument();
        });
    });

    describe('should render only when visible', () => {
        test('does not render when not in visible indexes', () => {
            render(
                <TestWrapper contextOverrides={{ showAll: false, visibleIndexes: [1, 2] }}>
                    <TimelineItem {...DEFAULT_PROPS} />
                </TestWrapper>
            );

            expect(screen.queryByText(TITLE)).toBeNull();
            expect(screen.queryByText(/Jan 30, 2000/)).toBeNull();
            expect(screen.queryByText(TIMESTAMP_VALUE)).toBeNull();
        });

        test('renders when not in visible indexes if show all is true', () => {
            render(
                <TestWrapper contextOverrides={{ showAll: true, visibleIndexes: [1, 2] }}>
                    <TimelineItem {...DEFAULT_PROPS} />
                </TestWrapper>
            );

            expect(screen.getByText(TITLE)).toBeInTheDocument();
            expect(screen.getByText(/Jan 30, 2000/)).toBeInTheDocument();
            expect(screen.getByText(new RegExp(TIMESTAMP_VALUE))).toBeInTheDocument();
        });
    });
});

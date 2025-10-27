/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/preact';
import { describe, expect, test, vi, beforeEach } from 'vitest';
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

const DEFAULT_CONTEXT: TimelineContextValue = {
    registerTimelineEntry: vi.fn(() => ({
        timelineEntriesRef: { current: [] },
        index: 0,
        unregister: vi.fn(),
    })),
    showAll: false,
    showMoreIndex: null,
    hiddenItems: null,
    visibleIndexes: [0],
    timeGapLimit: null,
    toggleShowAll: vi.fn(),
};

const TITLE = 'Milestone';
const TIMESTAMP_VALUE = 'Timestamp';
const TIMESTAMP_DATE = new Date('01-30-2000 14:00:00');

const DEFAULT_PROPS = {
    title: TITLE,
    timestamp: { date: TIMESTAMP_DATE, value: TIMESTAMP_VALUE },
};

describe('TimelineItem', () => {
    describe('should render props correctly', () => {
        test('required props: title and timestamp', () => {
            render(
                <TimelineContext.Provider value={DEFAULT_CONTEXT}>
                    <TimelineItem {...DEFAULT_PROPS} />
                </TimelineContext.Provider>
            );

            expect(screen.getByText(TITLE)).toBeInTheDocument();
            expect(screen.getByText(/Jan 30, 2000/)).toBeInTheDocument();
            expect(screen.getByText(new RegExp(TIMESTAMP_VALUE))).toBeInTheDocument();
        });

        test('description', () => {
            const DESCRIPTION = 'This is a description';
            render(
                <TimelineContext.Provider value={DEFAULT_CONTEXT}>
                    <TimelineItem {...DEFAULT_PROPS} description={DESCRIPTION} />
                </TimelineContext.Provider>
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
                <TimelineContext.Provider value={DEFAULT_CONTEXT}>
                    <TimelineItem {...DEFAULT_PROPS} dataList={DATA_LIST} />
                </TimelineContext.Provider>
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
                <TimelineContext.Provider value={DEFAULT_CONTEXT}>
                    <TimelineItem {...DEFAULT_PROPS} tag={TAG} />
                </TimelineContext.Provider>
            );

            expect(screen.getByText(TITLE)).toBeInTheDocument();
            expect(screen.getByText(/Jan 30, 2000/)).toBeInTheDocument();
            expect(screen.getByText(new RegExp(TIMESTAMP_VALUE))).toBeInTheDocument();
            expect(screen.getByText(TAG.label)).toBeInTheDocument();
        });
    });

    describe('should render show more correctly', () => {
        test('shows if show more index is the same as index and has number of hidden items', () => {
            const context: TimelineContextValue = {
                ...DEFAULT_CONTEXT,
                showMoreIndex: 0,
                hiddenItems: 2,
            };

            render(
                <TimelineContext.Provider value={context}>
                    <TimelineItem {...DEFAULT_PROPS} />
                </TimelineContext.Provider>
            );

            expect(screen.getByText(TITLE)).toBeInTheDocument();
            expect(screen.getByText(/Jan 30, 2000/)).toBeInTheDocument();
            expect(screen.getByText(new RegExp(TIMESTAMP_VALUE))).toBeInTheDocument();
            expect(screen.getByText('Show 2 more')).toBeInTheDocument();
        });

        test('button has show less if show all is true', () => {
            const context: TimelineContextValue = {
                ...DEFAULT_CONTEXT,
                showAll: true,
                showMoreIndex: 0,
                hiddenItems: 2,
            };

            render(
                <TimelineContext.Provider value={context}>
                    <TimelineItem {...DEFAULT_PROPS} />
                </TimelineContext.Provider>
            );

            expect(screen.getByText(TITLE)).toBeInTheDocument();
            expect(screen.getByText(/Jan 30, 2000/)).toBeInTheDocument();
            expect(screen.getByText(new RegExp(TIMESTAMP_VALUE))).toBeInTheDocument();
            expect(screen.getByText('Show less')).toBeInTheDocument();
        });
    });

    describe('should render only when visible', () => {
        test('does not render when not in visible indexes', () => {
            const context: TimelineContextValue = {
                ...DEFAULT_CONTEXT,
                visibleIndexes: [1, 2],
            };

            render(
                <TimelineContext.Provider value={context}>
                    <TimelineItem {...DEFAULT_PROPS} />
                </TimelineContext.Provider>
            );

            expect(screen.queryByText(TITLE)).toBeNull();
            expect(screen.queryByText(/Jan 30, 2000/)).toBeNull();
            expect(screen.queryByText(TIMESTAMP_VALUE)).toBeNull();
        });

        test('renders when not in visible indexes if show all is true', () => {
            const context: TimelineContextValue = {
                ...DEFAULT_CONTEXT,
                showAll: true,
                visibleIndexes: [1, 2],
            };

            render(
                <TimelineContext.Provider value={context}>
                    <TimelineItem {...DEFAULT_PROPS} />
                </TimelineContext.Provider>
            );

            expect(screen.getByText(TITLE)).toBeInTheDocument();
            expect(screen.getByText(/Jan 30, 2000/)).toBeInTheDocument();
            expect(screen.getByText(new RegExp(TIMESTAMP_VALUE))).toBeInTheDocument();
        });
    });
});

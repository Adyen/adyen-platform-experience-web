/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import Timeline from './Timeline';
import { TimelineItem } from './components/TimelineItem';
import useCoreContext from '../../../core/Context/useCoreContext';

vi.mock('../../../core/Context/useCoreContext');

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

describe('Timeline', () => {
    test('renders show more button when set and there are more items than limit', () => {
        render(
            <Timeline showMore={{ limit: 2, placement: 'bottom' }}>
                <TimelineItem title="Milestone 1" timestamp={{ date: new Date('01-30-2000') }} />
                <TimelineItem title="Milestone 2" timestamp={{ date: new Date('01-29-2000') }} />
                <TimelineItem title="Milestone 3" timestamp={{ date: new Date('01-09-2000') }} />
                <TimelineItem title="Milestone 4" timestamp={{ date: new Date('01-01-2000') }} />
            </Timeline>
        );

        expect(screen.getByText('Milestone 1')).toBeInTheDocument();
        expect(screen.getByText('Milestone 2')).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('does not render show more button when set but limit is bigger than items', () => {
        render(
            <Timeline showMore={{ limit: 5, placement: 'bottom' }}>
                <TimelineItem title="Milestone 1" timestamp={{ date: new Date('01-30-2000') }} />
                <TimelineItem title="Milestone 2" timestamp={{ date: new Date('01-29-2000') }} />
                <TimelineItem title="Milestone 3" timestamp={{ date: new Date('01-09-2000') }} />
                <TimelineItem title="Milestone 4" timestamp={{ date: new Date('01-01-2000') }} />
            </Timeline>
        );

        expect(screen.getByText('Milestone 1')).toBeInTheDocument();
        expect(screen.getByText('Milestone 2')).toBeInTheDocument();
        expect(screen.getByText('Milestone 3')).toBeInTheDocument();
        expect(screen.getByText('Milestone 4')).toBeInTheDocument();
        expect(screen.queryByRole('button')).toBeNull();
    });

    test('"show more" shows as "show less" after being pressed', () => {
        render(
            <Timeline showMore={{ limit: 2, placement: 'bottom' }}>
                <TimelineItem title="Milestone 1" timestamp={{ date: new Date('01-30-2000') }} />
                <TimelineItem title="Milestone 2" timestamp={{ date: new Date('01-29-2000') }} />
                <TimelineItem title="Milestone 3" timestamp={{ date: new Date('01-09-2000') }} />
                <TimelineItem title="Milestone 4" timestamp={{ date: new Date('01-01-2000') }} />
            </Timeline>
        );

        expect(screen.getByText('Milestone 1')).toBeInTheDocument();
        expect(screen.getByText('Milestone 2')).toBeInTheDocument();
        expect(screen.queryByText('Milestone 3')).toBeNull();
        expect(screen.queryByText('Milestone 4')).toBeNull();

        fireEvent.click(screen.getByRole('button'));

        expect(screen.getByText('Milestone 3')).toBeInTheDocument();
        expect(screen.getByText('Milestone 4')).toBeInTheDocument();
        expect(screen.getByText('Show less')).toBeInTheDocument();
    });

    test('timegap renders when timegap is greater than the limit', () => {
        render(
            <Timeline timeGapLimit={{ thresholdAmount: 15, unit: 'day' as const }}>
                <TimelineItem title="Milestone 1" timestamp={{ date: new Date('01-30-2000') }} />
                <TimelineItem title="Milestone 2" timestamp={{ date: new Date('01-29-2000') }} />
                <TimelineItem title="Milestone 3" timestamp={{ date: new Date('01-09-2000') }} />
                <TimelineItem title="Milestone 4" timestamp={{ date: new Date('01-01-2000') }} />
            </Timeline>
        );

        expect(screen.getByText('Milestone 1')).toBeInTheDocument();
        expect(screen.getByText('Milestone 2')).toBeInTheDocument();
        expect(screen.getByText('Milestone 3')).toBeInTheDocument();
        expect(screen.getByText('Milestone 4')).toBeInTheDocument();
        expect(screen.getByText('20 days')).toBeInTheDocument();
    });

    test('timegap doesnt render when timegap is not greater than the limit', () => {
        render(
            <Timeline timeGapLimit={{ thresholdAmount: 30, unit: 'day' }}>
                <TimelineItem title="Milestone 1" timestamp={{ date: new Date('01-30-2000') }} />
                <TimelineItem title="Milestone 2" timestamp={{ date: new Date('01-29-2000') }} />
                <TimelineItem title="Milestone 3" timestamp={{ date: new Date('01-09-2000') }} />
                <TimelineItem title="Milestone 4" timestamp={{ date: new Date('01-01-2000') }} />
            </Timeline>
        );

        expect(screen.getByText('Milestone 1')).toBeInTheDocument();
        expect(screen.getByText('Milestone 2')).toBeInTheDocument();
        expect(screen.getByText('Milestone 3')).toBeInTheDocument();
        expect(screen.getByText('Milestone 4')).toBeInTheDocument();
        expect(screen.queryByText('20 days')).toBeNull();
    });

    test('timegap doesnt render when one of the items is hidden', () => {
        render(
            <Timeline timeGapLimit={{ thresholdAmount: 15, unit: 'day' }} showMore={{ limit: 2, placement: 'before-last' }}>
                <TimelineItem title="Milestone 1" timestamp={{ date: new Date('01-30-2000') }} />
                <TimelineItem title="Milestone 2" timestamp={{ date: new Date('01-29-2000') }} />
                <TimelineItem title="Milestone 3" timestamp={{ date: new Date('01-09-2000') }} />
                <TimelineItem title="Milestone 4" timestamp={{ date: new Date('01-01-2000') }} />
            </Timeline>
        );

        expect(screen.getByText('Milestone 1')).toBeInTheDocument();
        expect(screen.queryByText('Milestone 2')).toBeNull();
        expect(screen.queryByText('Milestone 3')).toBeNull();
        expect(screen.getByText('Milestone 4')).toBeInTheDocument();
        expect(screen.queryByText('20 days')).toBeNull();

        fireEvent.click(screen.getByRole('button'));

        expect(screen.getByText('Milestone 1')).toBeInTheDocument();
        expect(screen.getByText('Milestone 2')).toBeInTheDocument();
        expect(screen.getByText('Milestone 3')).toBeInTheDocument();
        expect(screen.getByText('Milestone 4')).toBeInTheDocument();
        expect(screen.getByText('20 days')).toBeInTheDocument();
    });
});

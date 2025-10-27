import { ComponentChildren } from 'preact';
import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import { TimelineContext, RegisterTimelineEntryResult } from './context';
import { TimelineEntry, TimelineGapObject, TimelineShowMoreObject } from './types';
import './Timeline.scss';

export interface TimelineProps {
    children: ComponentChildren;
    showMore?: TimelineShowMoreObject | null;
    timeGapLimit?: TimelineGapObject | null;
}

export default function Timeline({ children, showMore = null, timeGapLimit = null }: TimelineProps) {
    const timelineEntriesRef = useRef<TimelineEntry[]>([]);
    const [showAll, setShowAll] = useState(false);
    const [, forceUpdate] = useState({});

    // Track entries length to trigger recalculation of memos
    const entriesLength = timelineEntriesRef.current.length;

    const hiddenItems = useMemo(() => {
        if (showMore && entriesLength > showMore.limit) {
            return entriesLength - showMore.limit;
        }
        return null;
    }, [showMore, entriesLength]);

    const visibleIndexes = useMemo(() => {
        if (!showMore || !entriesLength) {
            return null;
        }

        const timelineIndexes = Array.from(timelineEntriesRef.current.keys());

        if (showMore.placement === 'before-last') {
            const lastIndex = timelineIndexes[timelineIndexes.length - 1];
            if (lastIndex === undefined) return timelineIndexes.slice(0, showMore.limit);
            return [...timelineIndexes.slice(0, showMore.limit - 1), lastIndex];
        }

        if (showMore.placement === 'after-first') {
            const firstIndex = timelineIndexes[0];
            if (firstIndex === undefined) return timelineIndexes.slice(0, showMore.limit);
            return [firstIndex, ...timelineIndexes.slice(-(showMore.limit - 1))];
        }

        return timelineIndexes.slice(0, showMore.limit);
    }, [entriesLength, showMore]);

    const showMoreIndex = useMemo(() => {
        if (!showMore) {
            return null;
        }

        switch (showMore.placement) {
            case 'before-last':
                return showMore.limit - 2;
            case 'after-first':
                return 0;
            case 'bottom':
            default:
                return showMore.limit - 1;
        }
    }, [showMore]);

    const registerTimelineEntry = useCallback((entry: TimelineEntry): RegisterTimelineEntryResult => {
        const index = timelineEntriesRef.current.length;
        timelineEntriesRef.current.push(entry);
        forceUpdate({});

        const unregister = () => {
            timelineEntriesRef.current = timelineEntriesRef.current.filter((_, i) => i !== index);
            forceUpdate({});
        };

        return {
            timelineEntriesRef,
            index,
            unregister,
        };
    }, []);

    const toggleShowAll = useCallback(() => {
        setShowAll(!showAll);
    }, [showAll]);

    const contextValue = useMemo(
        () => ({
            registerTimelineEntry,
            showAll,
            showMoreIndex,
            hiddenItems,
            visibleIndexes,
            timeGapLimit,
            toggleShowAll,
        }),
        [registerTimelineEntry, showAll, showMoreIndex, hiddenItems, visibleIndexes, timeGapLimit, toggleShowAll]
    );

    return (
        <TimelineContext.Provider value={contextValue}>
            <div className="adyen-pe-timeline">
                <ol className="adyen-pe-timeline__items">{children}</ol>
            </div>
        </TimelineContext.Provider>
    );
}

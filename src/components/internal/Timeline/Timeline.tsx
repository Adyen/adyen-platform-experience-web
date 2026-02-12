import { ComponentChildren } from 'preact';
import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import { TimelineContext } from './context';
import { TimelineEntry, TimelineGapObject, TimelineShowMoreObject } from './types';
import './Timeline.scss';

export interface TimelineProps {
    children: ComponentChildren;
    showMore?: TimelineShowMoreObject | null;
    timeGapLimit?: TimelineGapObject | null;
}

export default function Timeline({ children, showMore = null, timeGapLimit = null }: TimelineProps) {
    const [entries, setEntries] = useState<TimelineEntry[]>([]);
    const [showAll, setShowAll] = useState(false);
    const entryIdCounter = useRef(0);

    const hiddenItems = useMemo(() => {
        if (showMore && entries.length > showMore.limit) {
            return entries.length - showMore.limit;
        }
        return null;
    }, [showMore, entries.length]);

    const visibleIndexes = useMemo(() => {
        if (!showMore || !entries.length) {
            return null;
        }

        const timelineIndexes = Array.from(entries.keys());

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
    }, [entries, showMore]);

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

    const registerTimelineEntry = useCallback((entry: TimelineEntry) => {
        // Assign unique ID to track this specific entry
        const entryId = entryIdCounter.current++;
        const entryWithId = { ...entry, _id: entryId };

        setEntries(prev => [...prev, entryWithId]);

        return () => {
            setEntries(prev => prev.filter(e => (e as any)._id !== entryId));
        };
    }, []);

    const toggleShowAll = useCallback(() => {
        setShowAll(!showAll);
    }, [showAll]);

    const contextValue = useMemo(
        () => ({
            registerTimelineEntry,
            entries,
            showAll,
            showMoreIndex,
            hiddenItems,
            visibleIndexes,
            timeGapLimit,
            toggleShowAll,
        }),
        [registerTimelineEntry, entries, showAll, showMoreIndex, hiddenItems, visibleIndexes, timeGapLimit, toggleShowAll]
    );

    return (
        <TimelineContext.Provider value={contextValue}>
            <div className="adyen-pe-timeline">
                <ol className="adyen-pe-timeline__items">{children}</ol>
            </div>
        </TimelineContext.Provider>
    );
}

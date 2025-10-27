import { createContext } from 'preact';
import { TimelineEntry, TimelineGapObject } from './types';

export interface RegisterTimelineEntryResult {
    timelineEntriesRef: { current: TimelineEntry[] };
    index: number;
    unregister: () => void;
}

export interface TimelineContextValue {
    registerTimelineEntry: (entry: TimelineEntry) => RegisterTimelineEntryResult;
    showAll: boolean;
    showMoreIndex: number | null;
    hiddenItems: number | null;
    visibleIndexes: number[] | null;
    timeGapLimit: TimelineGapObject | null;
    toggleShowAll: () => void;
}

export const TimelineContext = createContext<TimelineContextValue | null>(null);

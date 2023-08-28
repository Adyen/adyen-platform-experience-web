import { SELECT_NONE, SELECT_ONE } from '../../constants';
import { CalendarConfigurator, CalendarHighlighter } from '../../types';
import { struct } from '../../shared/utils';

const createHighlighter = (configurator: CalendarConfigurator) => {
    let startTimestamp = configurator.frame?.selectionStart;
    let endTimestamp = configurator.frame?.selectionEnd;

    const highlight = (() => {
        if (!configurator.frame || configurator.config?.highlight === SELECT_NONE) return;

        const { frame } = configurator;

        if (configurator.config?.highlight === SELECT_ONE || highlight.blank) {
            frame.selectionStart = frame?.getTimestampAtIndex(frame.cursor);
        }

        frame.selectionEnd = frame?.getTimestampAtIndex(frame.cursor + 1) - 1;
        startTimestamp = frame?.selectionStart;
        endTimestamp = frame?.selectionEnd;
    }) as CalendarHighlighter['highlight'];

    return struct({
        highlight: {
            value: Object.defineProperties(highlight, {
                blank: { get: () => startTimestamp === endTimestamp && endTimestamp === undefined },
            }),
        },
    }) as CalendarHighlighter;
};

export default createHighlighter;

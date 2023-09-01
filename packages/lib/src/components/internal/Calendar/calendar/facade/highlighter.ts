import { SELECT_NONE, SELECT_ONE, SELECTION_COLLAPSE, SELECTION_FROM, SELECTION_TO } from '../constants';
import { EMPTY_OBJECT } from '../shared/constants';
import { structFrom } from '../shared/utils';
import { CalendarConfigurator, CalendarHighlighter } from '../types';

const createHighlighter = (() => {
    const FAUX_SECRET = structFrom(EMPTY_OBJECT);

    return (configurator: CalendarConfigurator) => {
        const { chain: _chain } = configurator;

        let _startTimestamp: number | undefined;
        let _endTimestamp: number | undefined;
        let _pendingCommit = false;
        let startTimestamp = configurator.frame?.selectionStart;
        let endTimestamp = configurator.frame?.selectionEnd;

        const blank = (start = startTimestamp, end = endTimestamp) => start === end && end === undefined;

        const erase = _chain(() => {
            const { frame } = configurator;

            _pendingCommit = false;
            _startTimestamp = _endTimestamp = undefined;

            frame?.clearSelection();
            startTimestamp = frame?.selectionStart;
            endTimestamp = frame?.selectionEnd;
        });

        const highlight = _chain((secret?: any) => {
            const { frame } = configurator;
            const selection = configurator.config?.highlight;

            if (!frame || selection === SELECT_NONE) return;

            let _isNewHighlight = false;

            if (secret === FAUX_SECRET) {
                if (!_pendingCommit) return;
                if (!blank(_startTimestamp, _endTimestamp)) {
                    _startTimestamp = startTimestamp;
                    _endTimestamp = endTimestamp;
                }
            } else _isNewHighlight = selection !== SELECT_ONE;

            if (selection === SELECT_ONE || blank()) {
                frame.selectionStart = frame?.getTimestampAtIndex(frame.cursor);
            }

            frame.selectionEnd = frame?.getTimestampAtIndex(frame.cursor + 1) - 1;

            if (_isNewHighlight) {
                if (frame?.selectionStart !== startTimestamp) _pendingCommit = true;
                else if (_pendingCommit) {
                    _startTimestamp = _endTimestamp = undefined;
                    _pendingCommit = false;
                }
            }

            startTimestamp = frame?.selectionStart;
            endTimestamp = frame?.selectionEnd;
        });

        const restore = _chain(() => {
            _pendingCommit = false;

            if (configurator.frame && !blank(_startTimestamp, _endTimestamp)) {
                const { frame } = configurator;

                frame.selectionStart = _startTimestamp;
                frame.selectionEnd = _endTimestamp;

                startTimestamp = frame?.selectionStart;
                endTimestamp = frame?.selectionEnd;
            }

            _startTimestamp = _endTimestamp = undefined;
        });

        const setter = (selection: typeof SELECTION_FROM | typeof SELECTION_TO) =>
            _chain((time?: number | null) => {
                if (time == undefined) return erase();

                const { frame } = configurator;

                frame?.updateSelection(time, configurator.config?.highlight === SELECT_ONE || blank() ? SELECTION_COLLAPSE : selection);
                startTimestamp = frame?.selectionStart;
                endTimestamp = frame?.selectionEnd;
            });

        return Object.defineProperties(highlight as CalendarHighlighter, {
            blank: { get: () => blank() },
            erase: { value: erase },
            faux: { value: () => highlight(FAUX_SECRET) },
            inProgress: { get: () => _pendingCommit },
            restore: { value: restore },
            from: {
                get: () => startTimestamp,
                set: setter(SELECTION_FROM),
            },
            to: {
                get: () => endTimestamp,
                set: setter(SELECTION_TO),
            },
        });
    };
})();

export default createHighlighter;

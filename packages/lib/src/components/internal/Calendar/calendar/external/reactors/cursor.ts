import {
    CURSOR_BACKWARD,
    CURSOR_BLOCK_END,
    CURSOR_BLOCK_START,
    CURSOR_DOWNWARD,
    CURSOR_FORWARD,
    CURSOR_LINE_END,
    CURSOR_LINE_START,
    CURSOR_NEXT_BLOCK,
    CURSOR_PREV_BLOCK,
    CURSOR_UPWARD,
} from '../../constants';
import { TimeFrame } from '../../internal/timeframe';
import { isBitSafeInteger } from '../../shared/utils';
import { CalendarConfigurator } from '../../types';
import { InteractionKeyCode } from '@src/components/types';

const getCursorReactor = (() => {
    const triggerFrameSelection = (frame: TimeFrame) => {
        frame.updateSelection(frame.getTimestampAtIndex(frame.cursor));
    };

    return (configurator: CalendarConfigurator) =>
        (evt?: Event): true | undefined => {
            if (!(evt && configurator.frame && typeof configurator.configure.watch === 'function')) return;

            const { frame } = configurator;

            if (evt instanceof KeyboardEvent) {
                switch (evt.code) {
                    case InteractionKeyCode.ARROW_LEFT:
                        frame.shiftFrameCursor(CURSOR_BACKWARD);
                        break;
                    case InteractionKeyCode.ARROW_RIGHT:
                        frame.shiftFrameCursor(CURSOR_FORWARD);
                        break;
                    case InteractionKeyCode.ARROW_UP:
                        frame.shiftFrameCursor(CURSOR_UPWARD);
                        break;
                    case InteractionKeyCode.ARROW_DOWN:
                        frame.shiftFrameCursor(CURSOR_DOWNWARD);
                        break;
                    case InteractionKeyCode.HOME:
                        frame.shiftFrameCursor(evt.ctrlKey ? CURSOR_BLOCK_START : CURSOR_LINE_START);
                        break;
                    case InteractionKeyCode.END:
                        frame.shiftFrameCursor(evt.ctrlKey ? CURSOR_BLOCK_END : CURSOR_LINE_END);
                        break;
                    case InteractionKeyCode.PAGE_UP:
                        frame.shiftFrameCursor(CURSOR_PREV_BLOCK);
                        break;
                    case InteractionKeyCode.PAGE_DOWN:
                        frame.shiftFrameCursor(CURSOR_NEXT_BLOCK);
                        break;
                    case InteractionKeyCode.SPACE:
                    case InteractionKeyCode.ENTER:
                        triggerFrameSelection(frame);
                        break;
                    default:
                        return;
                }

                return true;
            }

            if (evt instanceof MouseEvent && evt.type === 'click' && typeof configurator.configure.cursorIndex === 'function') {
                const cursorIndex = configurator.configure.cursorIndex.call(configurator.config, evt);

                if (!isBitSafeInteger(cursorIndex)) return;
                frame.shiftFrameCursor(cursorIndex);

                if (frame.cursor === cursorIndex) {
                    triggerFrameSelection(frame);
                    return true;
                }
            }
        };
})();

export default getCursorReactor;

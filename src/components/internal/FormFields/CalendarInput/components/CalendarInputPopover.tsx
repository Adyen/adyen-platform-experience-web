import Popover from '../../../Popover/Popover';
import { PopoverContainerPosition, PopoverContainerSize, PopoverContainerVariant } from '../../../Popover/types';
import Calendar from '../../../Calendar';
import { DEFAULT_FIRST_WEEK_DAY } from '../../../Calendar/calendar/timerange/presets/shared/offsetWeek';
import calendar from '../../../Calendar/calendar';
import { CalendarProps } from '../../../Calendar/types';
import useCalendarControlsRendering from '../../../Calendar/hooks/useCalendarControlsRendering';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { MutableRef } from 'preact/hooks';

interface CalendarInputPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    originDate?: Date[];
    onHighlight: (from?: number) => void;
    getGridLabel: CalendarProps['getGridLabel'];
    targetElement: MutableRef<Element | null>;
}

export function CalendarInputPopover({ isOpen, onClose, originDate, onHighlight, getGridLabel, targetElement }: CalendarInputPopoverProps) {
    const { i18n } = useCoreContext();
    const [controlsRenderer, controlsContainerRef] = useCalendarControlsRendering();

    return (
        <Popover
            containerSize={PopoverContainerSize.MEDIUM}
            dismiss={() => {
                onClose();
            }}
            dismissible={false}
            divider
            fitPosition
            open={isOpen}
            position={PopoverContainerPosition.BOTTOM}
            targetElement={targetElement}
            withContentPadding
            variant={PopoverContainerVariant.POPOVER}
        >
            <div
                ref={controlsContainerRef}
                role="group"
                className={'adyen-pe-datepicker__controls'}
                aria-label={i18n.get('common.filters.types.date.calendar.navigation.label')}
            />
            <div>
                <Calendar
                    getGridLabel={getGridLabel}
                    firstWeekDay={DEFAULT_FIRST_WEEK_DAY}
                    controls={calendar.controls.MINIMAL}
                    highlight={calendar.highlight.ONE}
                    dynamicBlockRows={true}
                    onlyCellsWithin={true}
                    originDate={originDate}
                    onHighlight={onHighlight}
                    renderControl={controlsRenderer}
                    trackCurrentDay={true}
                />
            </div>
        </Popover>
    );
}

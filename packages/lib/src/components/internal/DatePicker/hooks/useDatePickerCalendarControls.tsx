import { useCallback } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import useDetachedRender from '../../../../hooks/element/useDetachedRender';
import Button from '../../Button';
import { CalendarShiftControl } from '@src/components/internal/Calendar/calendar/types';
import { WatchCallable } from '@src/components/internal/Calendar/calendar/shared/watchable/types';

const useDatePickerCalendarControls = () => {
    const { i18n } = useCoreContext();
    return useDetachedRender(
        useCallback(
            (targetElement, control: CalendarShiftControl, reactor: WatchCallable<any>) => {
                if (!(targetElement instanceof HTMLElement)) return null;

                let directionModifier: string;
                let labelModifier: 'next' | 'previous';
                let label: string;

                switch (control) {
                    case 'PREV':
                        directionModifier = 'prev';
                        labelModifier = 'previous';
                        label = '◀︎';
                        break;
                    case 'NEXT':
                        directionModifier = labelModifier = 'next';
                        label = '▶︎';
                        break;
                    default:
                        return null;
                }

                return (
                    <Button
                        aria-label={i18n.get(`calendar.${labelModifier}Month`)}
                        variant={'ghost'}
                        disabled={!reactor()}
                        classNameModifiers={['circle', directionModifier]}
                        label={label}
                        key={control}
                        onClick={reactor}
                    />
                );
            },
            [i18n]
        )
    );
};

export default useDatePickerCalendarControls;

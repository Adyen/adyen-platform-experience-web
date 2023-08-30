import { useCallback } from 'preact/hooks';
import { CalendarControlRenderer, CalendarRenderControl } from '../types';
import useCoreContext from '../../../../core/Context/useCoreContext';
import useDetachedRender from '../../../../hooks/element/useDetachedRender';
import Button from '../../Button';

const useCalendarControlsRendering = (renderControl?: CalendarRenderControl) => {
    const { i18n } = useCoreContext();

    return useDetachedRender(
        useCallback(
            ((targetElement, control, handle) => {
                if (!(targetElement instanceof HTMLElement)) return null;
                if (typeof renderControl === 'function') return renderControl(control, handle);

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
                        disabled={!handle()}
                        classNameModifiers={['circle', directionModifier]}
                        label={label}
                        key={control}
                        onClick={handle}
                    />
                );
            }) as CalendarControlRenderer,
            [i18n, renderControl]
        )
    );
};

export default useCalendarControlsRendering;

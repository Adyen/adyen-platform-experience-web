import { ButtonVariant } from '../../Button/types';
import { useCallback } from 'preact/hooks';
import { isFunction } from '../../../../utils';
import { CalendarControlRenderer, CalendarRenderControl } from '../types';
import useCoreContext from '../../../../core/Context/useCoreContext';
import useDetachedRender from '../../../../hooks/element/useDetachedRender';
import Button from '../../Button';
import Icon from '../../Icon';

const useCalendarControlsRendering = (renderControl?: CalendarRenderControl) => {
    const { i18n } = useCoreContext();

    return useDetachedRender(
        useCallback(
            ((targetElement, control, handle) => {
                if (!(targetElement instanceof HTMLElement)) return null;
                if (isFunction(renderControl)) return renderControl(control, handle);

                let directionModifier: string;
                let labelModifier: 'next' | 'previous';
                let iconName: 'chevron-left' | 'chevron-right';

                switch (control) {
                    case 'PREV':
                        directionModifier = 'prev';
                        labelModifier = 'previous';
                        iconName = 'chevron-left';
                        break;
                    case 'NEXT':
                        directionModifier = labelModifier = 'next';
                        iconName = 'chevron-right';
                        break;
                    default:
                        return null;
                }

                const shouldRenderControl = handle();

                return shouldRenderControl ? (
                    <Button
                        aria-label={i18n.get(`common.filters.types.date.calendar.navigation.${labelModifier}Month`)}
                        variant={ButtonVariant.TERTIARY}
                        disabled={!shouldRenderControl}
                        classNameModifiers={['circle', directionModifier]}
                        iconButton={true}
                        key={control}
                        onClick={handle}
                    >
                        <Icon name={iconName} />
                    </Button>
                ) : null;
            }) as CalendarControlRenderer,
            [i18n, renderControl]
        )
    );
};

export default useCalendarControlsRendering;

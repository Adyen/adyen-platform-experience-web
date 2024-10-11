import { ButtonVariant } from '../../Button/types';
import { useCallback } from 'preact/hooks';
import { isFunction } from '../../../../utils';
import Icon from '../../Icon';
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
                if (isFunction(renderControl)) return renderControl(control, handle);

                let directionModifier: string;
                let labelModifier: 'next' | 'previous';
                //TODO: Icon Check role presentation
                let Chevron: (props: any) => ReturnType<typeof Icon>;

                switch (control) {
                    case 'PREV':
                        directionModifier = 'prev';
                        labelModifier = 'previous';
                        Chevron = props => <Icon name={'chevron-up'} {...props} />;
                        break;
                    case 'NEXT':
                        directionModifier = labelModifier = 'next';
                        Chevron = props => <Icon name={'chevron-down'} {...props} />;
                        break;
                    default:
                        return null;
                }

                const shouldRenderControl = handle();

                return shouldRenderControl ? (
                    <Button
                        aria-label={i18n.get(`calendar.${labelModifier}Month`)}
                        variant={ButtonVariant.TERTIARY}
                        disabled={!shouldRenderControl}
                        classNameModifiers={['circle', directionModifier]}
                        iconButton={true}
                        key={control}
                        onClick={handle}
                    >
                        <Chevron role="presentation" />
                    </Button>
                ) : null;
            }) as CalendarControlRenderer,
            [i18n, renderControl]
        )
    );
};

export default useCalendarControlsRendering;

import Button from '../../Button';
import { ButtonActionsLayout, ButtonActionsList } from './types';
import { BUTTON_ACTION_CLASSNAME, BUTTON_ACTION_CONTAINER_CLASSNAME } from '../constants';
import { ButtonVariant } from '../types';
import './ButtonActions.scss';
import { memo } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import cx from 'classnames';

interface ButtonActionsProps {
    actions: ButtonActionsList;
    layout?: ButtonActionsLayout;
}
function ButtonActions({ actions, layout = ButtonActionsLayout.BUTTONS_END }: ButtonActionsProps) {
    const conditionalClasses = (): string => {
        return `${BUTTON_ACTION_CLASSNAME}--${layout}`;
    };

    const generateButtonVariantByIndex = (actionIndex: number) => {
        const lastActionIndex = actions.length - 1;
        return actionIndex === lastActionIndex ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY;
    };

    const reversedActions = useMemo(() => [...actions].reverse(), [actions]);

    return (
        <div className={BUTTON_ACTION_CLASSNAME}>
            <div className={`${BUTTON_ACTION_CONTAINER_CLASSNAME} ${conditionalClasses()}`} role="group">
                {reversedActions.map((button, index) => (
                    <Button
                        className={cx(button.classNames)}
                        aria-label={button.ariaLabel ?? button.title}
                        key={`${index}_${button.title || '0'}`}
                        disabled={button.disabled}
                        variant={button.variant || generateButtonVariantByIndex(index)}
                        onClick={button.event}
                        state={button.state ?? 'default'}
                        iconLeft={button.iconLeft}
                        iconRight={button.iconRight}
                    >
                        {button.renderTitle ? button.renderTitle(button.title) : button.title}
                    </Button>
                ))}
            </div>
        </div>
    );
}

export default memo(ButtonActions);

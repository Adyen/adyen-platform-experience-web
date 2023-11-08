import Button from '@src/components/internal/Button';
import { ButtonActionsLayout, ButtonActionsList } from '@src/components/internal/Button/ButtonActions/types';
import { BUTTON_ACTION_CLASSNAME, BUTTON_ACTION_CONTAINER_CLASSNAME } from '@src/components/internal/Button/constants';
import { ButtonVariant } from '@src/components/internal/Button/types';
import './ButtonActions.scss';
import { memo } from 'preact/compat';
import { useMemo } from 'preact/hooks';

interface ButtonActionsProps {
    actions: ButtonActionsList;
    layout?: ButtonActionsLayout;
}
function ButtonActions({ actions, layout = ButtonActionsLayout.BUTTONS_END }: ButtonActionsProps) {
    const conditionalClasses = (): string => {
        return `adyen-fp-button-actions--${layout}`;
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
                        aria-label={''}
                        key={index}
                        disabled={button.disabled}
                        variant={button.variant || generateButtonVariantByIndex(index)}
                        onClick={button.event}
                    >
                        {button.title}
                    </Button>
                ))}
            </div>
        </div>
    );
}

export default memo(ButtonActions);

import Button from '@src/components/internal/Button';
import { ButtonActionsLayout, ButtonActionsList } from '@src/components/internal/Button/ButtonActions/types';
import { ButtonVariant } from '@src/components/internal/Button/types';
import './ButtonActions.scss';
import { useMemo } from 'preact/hooks';

interface ButtonActionsProps {
    actions: ButtonActionsList;
    layout?: ButtonActionsLayout;
}
export default function ButtonActions({ actions, layout = ButtonActionsLayout.BUTTONS_END }: ButtonActionsProps) {
    const conditionalClasses = (): string => {
        return `adyen-fp-button-actions--${layout}`;
    };

    const generateButtonVariantByIndex = (actionIndex: number) => {
        const lastActionIndex = actions.length - 1;
        return actionIndex === lastActionIndex ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY;
    };

    // const reversedActions = useMemo(() =>  {
    //     return [...actions].reverse()
    // }, [actions])

    return (
        <div className="adyen-fp-button-actions">
            <div className={`adyen-fp-button-actions__container-wrapper ${conditionalClasses()}`} role="group">
                {actions.reverse().map((button, index) => (
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

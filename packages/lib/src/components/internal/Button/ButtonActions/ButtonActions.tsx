import { ButtonActionsLayout, ButtonActionsList } from '@src/components/internal/Button/ButtonActions/types';
import Button from '@src/components/internal/Button';
import { ButtonVariants } from '@src/components/internal/Button/types';
import './ButtonActions.scss';
interface ButtonActionsProps {
    actions: ButtonActionsList;
    layout?: ButtonActionsLayout;
}
export default function ButtonActions({ actions, layout = ButtonActionsLayout.BUTTONS_END }: ButtonActionsProps) {
    const conditionalClasses = (): string => {
        return `button-actions--${layout}`;
    };

    const generateButtonVariantByIndex = (actionIndex: number) => {
        const lastActionIndex = actions.length - 1;
        return actionIndex === lastActionIndex ? ButtonVariants.PRIMARY : ButtonVariants.SECONDARY;
    };

    return (
        <div className="button-actions">
            <div className={`button-actions__container-wrapper ${conditionalClasses()}`} role="group">
                {actions.reverse().map((button, index) => (
                    <Button
                        label={button.title}
                        key={index}
                        critical={button.critical}
                        disabled={button.disabled}
                        variant={button.variant || generateButtonVariantByIndex(index)}
                        onClick={button.event}
                    >
                        {/*TO-DO: Add icon option here */}
                        {/*{button.title}*/}
                    </Button>
                ))}
            </div>
        </div>
    );
}

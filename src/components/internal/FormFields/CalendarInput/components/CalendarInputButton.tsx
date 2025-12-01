import Button from '../../../Button';
import { ButtonVariant } from '../../../Button/types';
import Icon from '../../../Icon';
import cx from 'classnames';

interface CalendarInputButtonProps {
    label: string;
    isOpen: boolean;
    isInvalid?: boolean;
    onClick: () => void;
    buttonRef: React.RefObject<HTMLButtonElement>;
}

export function CalendarInputButton({ label, isOpen, isInvalid, onClick, buttonRef }: CalendarInputButtonProps) {
    return (
        <Button
            ref={buttonRef}
            onClick={e => {
                e.preventDefault();
                onClick();
            }}
            variant={ButtonVariant.SECONDARY}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-invalid={isInvalid ? 'true' : undefined}
            className={cx('adyen-pe-button adyen-pe-dropdown__button', {
                ['adyen-pe-button--invalid']: isInvalid,
            })}
            iconRight={<Icon className="adyen-pe-dropdown__button-collapse-indicator" name="chevron-down" />}
        >
            <span>{label}</span>
        </Button>
    );
}

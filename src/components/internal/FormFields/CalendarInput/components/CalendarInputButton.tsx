import Button from '../../../Button';
import { ButtonVariant } from '../../../Button/types';
import Icon from '../../../Icon';
import cx from 'classnames';
import { MutableRef } from 'preact/hooks';

interface CalendarInputButtonProps {
    label: string;
    isOpen: boolean;
    isInvalid?: boolean;
    onClick: () => void;
    onClear?: (e?: Event) => void;
    showClearButton?: boolean;
    buttonRef: MutableRef<HTMLButtonElement | null>;
}

export function CalendarInputButton({ label, isOpen, isInvalid, onClick, onClear, showClearButton, buttonRef }: CalendarInputButtonProps) {
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
            iconRight={
                showClearButton ? (
                    <>
                        <button
                            className="adyen-pe-dropdown__button-clear"
                            onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                onClear?.(e as unknown as Event);
                            }}
                            type="button"
                        >
                            <Icon name="clear" />
                        </button>
                    </>
                ) : (
                    <Icon className="adyen-pe-dropdown__button-collapse-indicator" name="chevron-down" />
                )
            }
        >
            <span>{label}</span>
        </Button>
    );
}

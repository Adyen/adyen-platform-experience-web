import Button from '../../Button';
import { ButtonVariant } from '../../Button/types';
import './PopoverDismissButton.scss';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { memo } from 'preact/compat';

interface PopoverDismissButtonProps {
    image?: boolean;
    onClick: () => void;
}

function PopoverDismissButton({ image = true, onClick }: PopoverDismissButtonProps) {
    const { i18n } = useCoreContext();
    const getConditionalClasses = (): string => {
        return image ? 'adyen-pe-popover-dismiss-button--on-image' : '';
    };
    return (
        <>
            <Button
                className={getConditionalClasses()}
                iconButton={true}
                variant={ButtonVariant.TERTIARY}
                onClick={onClick}
                aria-label={i18n.get('closeIconLabel')}
            >
                <svg role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none">
                    <title>{'dismiss'}</title>
                    <path
                        fill="#00112C"
                        fillRule="evenodd"
                        d="M11.4697 12.5303C11.7626 12.8232 12.2374 12.8232 12.5303 12.5303C12.8232 12.2374 12.8232 11.7626 12.5303 11.4697L9.06066 8L12.5303 4.53033C12.8232 4.23744 12.8232 3.76256 12.5303 3.46967C12.2374 3.17678 11.7626 3.17678 11.4697 3.46967L8 6.93934L4.53033 3.46967C4.23744 3.17678 3.76256 3.17678 3.46967 3.46967C3.17678 3.76256 3.17678 4.23744 3.46967 4.53033L6.93934 8L3.46967 11.4697C3.17678 11.7626 3.17678 12.2374 3.46967 12.5303C3.76256 12.8232 4.23744 12.8232 4.53033 12.5303L8 9.06066L11.4697 12.5303Z"
                        clipRule="evenodd"
                    />
                </svg>
            </Button>
        </>
    );
}

export default memo(PopoverDismissButton);

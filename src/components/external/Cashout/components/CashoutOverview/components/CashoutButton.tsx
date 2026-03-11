import { FunctionalComponent } from 'preact';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import Button from '../../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../../internal/Button/types';

interface CashoutButtonProps {
    disabled: boolean;
    onClick?: () => void;
}

export const CashoutButton: FunctionalComponent<CashoutButtonProps> = ({ disabled, onClick }) => {
    const { i18n } = useCoreContext();

    return (
        <Button disabled={disabled} variant={ButtonVariant.PRIMARY} onClick={onClick}>
            {i18n.get('cashout.overview.instantCashout')}
        </Button>
    );
};

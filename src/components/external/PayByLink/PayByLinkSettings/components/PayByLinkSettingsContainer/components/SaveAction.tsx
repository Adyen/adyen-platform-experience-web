import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import { useSaveAction } from '../../../hooks/useSaveAction';
import Button from '../../../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../../../internal/Button/types';

const SaveAction = () => {
    const { i18n } = useCoreContext();
    const { onSave } = useSaveAction();
    return (
        <div className="adyen-pe-pay-by-link-settings__cta-container">
            <Button variant={ButtonVariant.PRIMARY} onClick={onSave}>
                {i18n.get('payByLink.settings.common.action.save')}
            </Button>
        </div>
    );
};

export default SaveAction;

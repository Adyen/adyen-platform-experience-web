import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import Button from '../../../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../../../internal/Button/types';
import usePayByLinkSettingsContext from '../context/context';
import { containerQueries, useResponsiveContainer } from '../../../../../../../hooks/useResponsiveContainer';
import cx from 'classnames';

const SaveAction = () => {
    const { i18n } = useCoreContext();
    const { onSave, isSaving } = usePayByLinkSettingsContext();
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);

    return (
        <div
            className={cx('adyen-pe-pay-by-link-settings__cta-container', { 'adyen-pe-pay-by-link-settings__cta-container--mobile': isSmContainer })}
        >
            <Button
                state={isSaving ? 'loading' : undefined}
                disabled={!!isSaving}
                variant={ButtonVariant.PRIMARY}
                onClick={onSave}
                fullWidth={isSmContainer}
            >
                {i18n.get('payByLink.settings.common.action.save')}
            </Button>
        </div>
    );
};

export default SaveAction;

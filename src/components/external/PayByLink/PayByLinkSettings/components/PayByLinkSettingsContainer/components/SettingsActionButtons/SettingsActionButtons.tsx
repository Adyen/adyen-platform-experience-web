import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import usePayByLinkSettingsContext from '../../context/context';
import { containerQueries, useResponsiveContainer } from '../../../../../../../../hooks/useResponsiveContainer';
import { boolOrFalse, noop } from '../../../../../../../../utils';
import { ButtonActionObject, ButtonActionsLayout, ButtonActionsLayoutBasic } from '../../../../../../../internal/Button/ButtonActions/types';
import ButtonActions from '../../../../../../../internal/Button/ButtonActions/ButtonActions';
import { useMemo } from 'preact/hooks';
import './SettingsActionButton.scss';
import { ButtonVariant } from '../../../../../../../internal/Button/types';

const SettingsActionButtons = ({ navigateBack }: { navigateBack?: () => void | undefined }) => {
    const { i18n } = useCoreContext();
    const { onSave, isSaving } = usePayByLinkSettingsContext();
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);

    const saveButton = useMemo(() => {
        return {
            disabled: boolOrFalse(isSaving),
            event: onSave,
            title: i18n.get('payByLink.settings.common.action.save'),
            variant: ButtonVariant.PRIMARY,
            classNames: isSmContainer ? ['adyen-pe-pay-by-link-settings__cta-container--mobile'] : [],
        } as ButtonActionObject;
    }, [i18n, onSave, isSaving, isSmContainer]);

    const goBackButton = useMemo(() => {
        return {
            event: navigateBack ?? noop,
            title: i18n.get('paymentLinks.common.actions.goBack'),
            variant: ButtonVariant.SECONDARY,
            classNames: isSmContainer ? ['adyen-pe-pay-by-link-settings__cta-container--mobile'] : [],
        } as ButtonActionObject;
    }, [navigateBack, i18n, isSmContainer]);

    const buttonActions = useMemo(() => {
        if (!navigateBack) return [saveButton];
        return isSmContainer ? [goBackButton, saveButton] : [saveButton, goBackButton];
    }, [saveButton, goBackButton, navigateBack, isSmContainer]);

    const layout = useMemo(() => (isSmContainer ? ButtonActionsLayout.VERTICAL_STACK : ButtonActionsLayoutBasic.BUTTONS_END), [isSmContainer]);

    return <ButtonActions actions={buttonActions} layout={layout} />;
};

export default SettingsActionButtons;

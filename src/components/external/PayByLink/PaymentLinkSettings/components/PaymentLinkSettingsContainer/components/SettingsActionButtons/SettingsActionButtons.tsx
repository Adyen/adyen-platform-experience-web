import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import usePayByLinkSettingsContext from '../../context/context';
import { containerQueries, useResponsiveContainer } from '../../../../../../../../hooks/useResponsiveContainer';
import { boolOrFalse, noop } from '../../../../../../../../utils';
import { ButtonActionObject, ButtonActionsLayout, ButtonActionsLayoutBasic } from '../../../../../../../internal/Button/ButtonActions/types';
import ButtonActions from '../../../../../../../internal/Button/ButtonActions/ButtonActions';
import { useMemo } from 'preact/hooks';
import './SettingsActionButton.scss';
import { ButtonVariant } from '../../../../../../../internal/Button/types';
import cx from 'classnames';
import Icon from '../../../../../../../internal/Icon';

const SettingsActionButtons = ({ navigateBack, closeContent }: { navigateBack?: () => void | undefined; closeContent?: () => void | undefined }) => {
    const { i18n } = useCoreContext();
    const { onSave, isSaving, isLoadingContent, isLoadingStores, isSaveSuccess } = usePayByLinkSettingsContext();
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
    const isLoading = isLoadingContent || isLoadingStores;

    const saveButton = useMemo(() => {
        return {
            disabled: boolOrFalse(isSaving || isLoading || (navigateBack && isSaveSuccess)),
            event: onSave,
            iconLeft:
                navigateBack && isSaveSuccess ? (
                    <Icon className={'adyen-pe-payment-link-settings-save-success__cta-icon'} name={'checkmark'} />
                ) : undefined,
            title: i18n.get('payByLink.settings.common.action.save'),
            variant: ButtonVariant.PRIMARY,
            state: boolOrFalse(isSaving && !(navigateBack && isSaveSuccess)) ? 'loading' : 'default',
            classNames: isSmContainer ? ['adyen-pe-payment-link-settings__cta--mobile'] : [],
        } as ButtonActionObject;
    }, [i18n, onSave, isSaving, isSmContainer, navigateBack, isSaveSuccess, isLoading]);

    const goBackButton = useMemo(() => {
        return {
            disabled: boolOrFalse(isLoading),
            event: navigateBack ?? closeContent ?? noop,
            title: i18n.get('payByLink.common.actions.goBack'),
            variant: ButtonVariant.SECONDARY,
            classNames: isSmContainer ? ['adyen-pe-payment-link-settings__cta--mobile'] : [],
        } as ButtonActionObject;
    }, [navigateBack, i18n, isSmContainer, closeContent, isLoading]);

    const buttonActions = useMemo(() => {
        if (!navigateBack && !closeContent) return [saveButton];
        return [saveButton, goBackButton];
    }, [saveButton, goBackButton, navigateBack, closeContent]);

    const layout = useMemo(() => (isSmContainer ? ButtonActionsLayout.VERTICAL_STACK : ButtonActionsLayoutBasic.BUTTONS_END), [isSmContainer]);

    return (
        <div
            className={cx('adyen-pe-payment-link-settings__cta-container', {
                ['adyen-pe-payment-link-settings__cta-container--mobile']: isSmContainer,
            })}
        >
            <ButtonActions actions={buttonActions} layout={layout} />
        </div>
    );
};

export default SettingsActionButtons;

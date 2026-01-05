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

const SettingsActionButtons = ({ navigateBack, closeContent }: { navigateBack?: () => void | undefined; closeContent?: () => void | undefined }) => {
    const { i18n } = useCoreContext();
    const { onSave, isSaving, isLoadingContent } = usePayByLinkSettingsContext();
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);

    const saveButton = useMemo(() => {
        return {
            disabled: boolOrFalse(isSaving || isLoadingContent),
            event: onSave,
            title: i18n.get('payByLink.settings.common.action.save'),
            variant: ButtonVariant.PRIMARY,
            state: boolOrFalse(isSaving) ? 'loading' : 'default',
            classNames: isSmContainer ? ['adyen-pe-pay-by-link-settings__cta--mobile'] : [],
        } as ButtonActionObject;
    }, [i18n, onSave, isSaving, isSmContainer, isLoadingContent]);

    const goBackButton = useMemo(() => {
        return {
            disabled: boolOrFalse(isLoadingContent),
            event: navigateBack ?? closeContent ?? noop,
            title: i18n.get('paymentLinks.common.actions.goBack'),
            variant: ButtonVariant.SECONDARY,
            classNames: isSmContainer ? ['adyen-pe-pay-by-link-settings__cta--mobile'] : [],
        } as ButtonActionObject;
    }, [navigateBack, i18n, isSmContainer, closeContent, isLoadingContent]);

    const buttonActions = useMemo(() => {
        if (!navigateBack && !closeContent) return [saveButton];
        return [saveButton, goBackButton];
    }, [saveButton, goBackButton, navigateBack, closeContent]);

    const layout = useMemo(() => (isSmContainer ? ButtonActionsLayout.VERTICAL_STACK : ButtonActionsLayoutBasic.BUTTONS_END), [isSmContainer]);

    return (
        <div
            className={cx('adyen-pe-pay-by-link-settings__cta-container', {
                ['adyen-pe-pay-by-link-settings__cta-container--mobile']: isSmContainer,
            })}
        >
            <ButtonActions actions={buttonActions} layout={layout} />
        </div>
    );
};

export default SettingsActionButtons;
